from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.paper import ResearchPaper, PaperChunk
from app.models.comparison import PaperComparison
from app.schemas.comparison import ComparisonRequest, ComparisonOut
from app.services.comparison_service import comparison_service

router = APIRouter(prefix="/compare", tags=["Multi-Paper Comparison"])


@router.post("", response_model=ComparisonOut, status_code=status.HTTP_200_OK)
def compare_papers_endpoint(
    payload: ComparisonRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if len(payload.paper_ids) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least 2 research papers are required for side-by-side comparison.",
        )

    papers = db.query(ResearchPaper).filter(ResearchPaper.id.in_(payload.paper_ids)).all()
    if len(papers) < 2:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="One or more specified papers could not be found.",
        )

    papers_data = []
    for p in papers:
        chunks = db.query(PaperChunk).filter(PaperChunk.paper_id == p.id).order_by(PaperChunk.chunk_index.asc()).limit(6).all()
        papers_data.append({
            "id": p.id,
            "title": p.title,
            "abstract": p.abstract,
            "venue": p.venue,
            "publication_year": p.publication_year,
            "chunks": [c.content for c in chunks],
        })

    result = comparison_service.compare_papers(papers_data)
    if "error" in result:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["error"])

    # Persist comparison record
    comparison_record = PaperComparison(
        user_id=current_user.id,
        paper_ids=[p.id for p in papers],
        paper_titles=[p.title for p in papers],
        synthesis=result["synthesis"],
        matrix=result["matrix"],
        research_gaps=result["research_gaps"],
    )
    db.add(comparison_record)
    db.commit()
    db.refresh(comparison_record)

    return ComparisonOut(
        id=comparison_record.id,
        paper_ids=comparison_record.paper_ids,
        paper_titles=comparison_record.paper_titles,
        synthesis=comparison_record.synthesis,
        matrix=comparison_record.matrix,
        research_gaps=comparison_record.research_gaps,
        created_at=comparison_record.created_at,
    )


@router.get("", response_model=List[ComparisonOut])
def list_comparisons(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    records = (
        db.query(PaperComparison)
        .filter(PaperComparison.user_id == current_user.id)
        .order_by(PaperComparison.created_at.desc())
        .limit(20)
        .all()
    )
    return [
        ComparisonOut(
            id=r.id,
            paper_ids=r.paper_ids,
            paper_titles=r.paper_titles,
            synthesis=r.synthesis,
            matrix=r.matrix,
            research_gaps=r.research_gaps,
            created_at=r.created_at,
        )
        for r in records
    ]


@router.get("/{comparison_id}", response_model=ComparisonOut)
def get_comparison(
    comparison_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    r = (
        db.query(PaperComparison)
        .filter(PaperComparison.id == comparison_id, PaperComparison.user_id == current_user.id)
        .first()
    )
    if not r:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comparison record not found.")

    return ComparisonOut(
        id=r.id,
        paper_ids=r.paper_ids,
        paper_titles=r.paper_titles,
        synthesis=r.synthesis,
        matrix=r.matrix,
        research_gaps=r.research_gaps,
        created_at=r.created_at,
    )
