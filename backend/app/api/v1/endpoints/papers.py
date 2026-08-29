import os
import shutil
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.config import settings
from app.models.user import User, UserRole
from app.models.paper import ResearchPaper, PaperChunk, PaperSummary
from app.schemas.paper import PaperOut, PaperChunkOut, PaperSummaryOut, PaperUploadResponse
from app.services.pdf_extractor import extract_pdf_data
from app.services.text_chunker import chunk_extracted_pages
from app.services.vector_store import vector_store_service
from app.services.summary_service import summary_service

router = APIRouter(prefix="/papers", tags=["Research Papers"])


@router.post("/upload", response_model=PaperUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_paper(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    publication_year: Optional[int] = Form(None),
    venue: Optional[str] = Form(None),
    doi: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not file.filename.lower().endswith((".pdf", ".txt")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF and text research files are supported.",
        )

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    # Ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    saved_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, saved_filename)
    with open(file_path, "wb") as f:
        f.write(file_bytes)

    # Extract text and metadata
    extracted = extract_pdf_data(file_bytes, filename=file.filename)
    paper_title = title if title and title.strip() else extracted.title

    # Create paper record
    paper = ResearchPaper(
        title=paper_title,
        abstract=extracted.abstract,
        authors=extracted.authors,
        publication_year=publication_year,
        venue=venue,
        doi=doi,
        file_path=file_path,
        file_size=len(file_bytes),
        total_pages=extracted.total_pages,
        owner_id=current_user.id,
    )
    db.add(paper)
    db.flush()

    # Chunk text
    raw_chunks = chunk_extracted_pages(extracted.pages)
    chunk_dicts = [c.to_dict() for c in raw_chunks]

    # Index into vector store
    chroma_ids = vector_store_service.index_paper_chunks(paper.id, chunk_dicts)

    # Save chunks to database
    db_chunks = []
    for idx, c in enumerate(raw_chunks):
        c_id = chroma_ids[idx] if idx < len(chroma_ids) else None
        db_chunk = PaperChunk(
            paper_id=paper.id,
            chunk_index=c.chunk_index,
            section_name=c.section_name,
            content=c.content,
            token_count=c.token_count,
            page_number=c.page_number,
            chroma_id=c_id,
        )
        db_chunks.append(db_chunk)

    db.add_all(db_chunks)
    paper.total_chunks = len(db_chunks)
    db.commit()
    db.refresh(paper)

    return PaperUploadResponse(
        message="Research paper uploaded, processed, and indexed successfully.",
        paper=paper,
        extracted_chunks=len(db_chunks),
        processed_pages=extracted.total_pages,
    )


@router.get("", response_model=List[PaperOut])
def list_papers(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(ResearchPaper)
    # Admin and Professor can view all papers; Students/Researchers view their own
    if current_user.role not in [UserRole.ADMIN, UserRole.PROFESSOR]:
        query = query.filter(ResearchPaper.owner_id == current_user.id)
    return query.order_by(ResearchPaper.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{paper_id}", response_model=PaperOut)
def get_paper_detail(
    paper_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    paper = db.query(ResearchPaper).filter(ResearchPaper.id == paper_id).first()
    if not paper:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Research paper not found.",
        )
    if current_user.role not in [UserRole.ADMIN, UserRole.PROFESSOR] and paper.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden to this research paper.",
        )
    return paper


@router.get("/{paper_id}/chunks", response_model=List[PaperChunkOut])
def get_paper_chunks(
    paper_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    paper = db.query(ResearchPaper).filter(ResearchPaper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paper not found.")
    return db.query(PaperChunk).filter(PaperChunk.paper_id == paper_id).order_by(PaperChunk.chunk_index.asc()).all()


@router.delete("/{paper_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_paper(
    paper_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    paper = db.query(ResearchPaper).filter(ResearchPaper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paper not found.")
    if current_user.role != UserRole.ADMIN and paper.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this paper.")

    vector_store_service.delete_paper_chunks(paper_id)
    if os.path.exists(paper.file_path):
        try:
            os.remove(paper.file_path)
        except Exception:
            pass

    db.delete(paper)
    db.commit()
    return None


@router.post("/{paper_id}/summary", response_model=PaperSummaryOut, status_code=status.HTTP_200_OK)
def generate_paper_summary(
    paper_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    paper = db.query(ResearchPaper).filter(ResearchPaper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paper not found.")

    chunks = db.query(PaperChunk).filter(PaperChunk.paper_id == paper_id).order_by(PaperChunk.chunk_index.asc()).limit(8).all()
    chunk_texts = [c.content for c in chunks]

    summary_data = summary_service.generate_summary(
        title=paper.title,
        abstract=paper.abstract,
        chunks=chunk_texts,
    )

    # Check if summary already exists
    existing_summary = db.query(PaperSummary).filter(PaperSummary.paper_id == paper_id).first()
    if existing_summary:
        existing_summary.executive_summary = summary_data["executive_summary"]
        existing_summary.key_findings = summary_data["key_findings"]
        existing_summary.methodology = summary_data["methodology"]
        existing_summary.limitations = summary_data["limitations"]
        existing_summary.future_scope = summary_data["future_scope"]
        summary_record = existing_summary
    else:
        summary_record = PaperSummary(
            paper_id=paper.id,
            executive_summary=summary_data["executive_summary"],
            key_findings=summary_data["key_findings"],
            methodology=summary_data["methodology"],
            limitations=summary_data["limitations"],
            future_scope=summary_data["future_scope"],
        )
        db.add(summary_record)

    db.commit()
    db.refresh(summary_record)
    return summary_record


@router.get("/{paper_id}/summary", response_model=PaperSummaryOut)
def get_paper_summary(
    paper_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    summary = db.query(PaperSummary).filter(PaperSummary.paper_id == paper_id).first()
    if not summary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Summary has not been generated for this paper yet.",
        )
    return summary

