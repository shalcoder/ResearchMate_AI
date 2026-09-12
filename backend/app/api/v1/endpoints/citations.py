from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.paper import ResearchPaper
from app.models.citation import CitationExport
from app.schemas.citation import (
    CitationGenerateRequest,
    CitationAllFormatsResponse,
    CitationExportOut,
)
from app.services.citation_service import citation_service

router = APIRouter(prefix="/citations", tags=["Academic Citations Engine"])


@router.get("/{paper_id}", response_model=CitationAllFormatsResponse)
def get_paper_citations(
    paper_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    paper = db.query(ResearchPaper).filter(ResearchPaper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Research paper not found.")

    formatted = citation_service.format_all(
        title=paper.title,
        authors=paper.authors or [],
        year=paper.publication_year,
        venue=paper.venue,
        doi=paper.doi,
    )

    return CitationAllFormatsResponse(
        paper_id=paper.id,
        paper_title=paper.title,
        apa=formatted["apa"],
        mla=formatted["mla"],
        ieee=formatted["ieee"],
        harvard=formatted["harvard"],
        chicago=formatted["chicago"],
        bibtex=formatted["bibtex"],
    )


@router.post("/export", response_model=CitationExportOut, status_code=status.HTTP_201_CREATED)
def export_citation(
    payload: CitationGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    paper = db.query(ResearchPaper).filter(ResearchPaper.id == payload.paper_id).first()
    if not paper:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Research paper not found.")

    formatted = citation_service.format_all(
        title=paper.title,
        authors=paper.authors or [],
        year=paper.publication_year,
        venue=paper.venue,
        doi=paper.doi,
    )

    style = (payload.format or "apa").lower()
    citation_text = formatted.get(style, formatted["apa"])

    export_record = CitationExport(
        paper_id=paper.id,
        user_id=current_user.id,
        format=style,
        citation_text=citation_text,
    )
    db.add(export_record)
    db.commit()
    db.refresh(export_record)
    return export_record


@router.get("/exports/my", response_model=List[CitationExportOut])
def list_user_exported_citations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(CitationExport)
        .filter(CitationExport.user_id == current_user.id)
        .order_by(CitationExport.created_at.desc())
        .all()
    )
