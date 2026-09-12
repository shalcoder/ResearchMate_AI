from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.paper import ResearchPaper, PaperChunk
from app.schemas.search import SearchResponse, SearchResultItem
from app.services.vector_store import vector_store_service

router = APIRouter(prefix="/search", tags=["Semantic & Keyword Search"])


@router.get("", response_model=SearchResponse)
def search_repository(
    q: str = Query(..., min_length=1, description="Semantic or keyword query"),
    venue: str = Query(None, description="Optional venue filter"),
    year: int = Query(None, description="Optional publication year filter"),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 1. Query vector store for similar chunks across all papers
    vector_results = vector_store_service.query_similar_chunks(query=q, n_results=limit * 2)

    # 2. Gather paper details & apply filters
    results: List[SearchResultItem] = []
    seen_papers = set()

    for vr in vector_results:
        meta = vr.get("metadata", {})
        paper_id = meta.get("paper_id")
        if not paper_id:
            continue

        paper = db.query(ResearchPaper).filter(ResearchPaper.id == paper_id).first()
        if not paper:
            continue

        # Check venue and year filters if provided
        if venue and paper.venue and venue.lower() not in paper.venue.lower():
            continue
        if year and paper.publication_year and paper.publication_year != year:
            continue

        results.append(
            SearchResultItem(
                paper_id=paper.id,
                paper_title=paper.title,
                venue=paper.venue,
                publication_year=paper.publication_year,
                chunk_index=meta.get("chunk_index", 0),
                page_number=meta.get("page_number", 1),
                section_name=meta.get("section_name", "Body"),
                content_snippet=vr.get("content", "")[:300] + "...",
                relevance_score=vr.get("score", 0.75),
            )
        )
        if len(results) >= limit:
            break

    # 3. Fallback: if vector store returned few results, do keyword match on title/abstract
    if len(results) < limit:
        kw_papers = (
            db.query(ResearchPaper)
            .filter(
                (ResearchPaper.title.ilike(f"%{q}%")) | (ResearchPaper.abstract.ilike(f"%{q}%"))
            )
            .limit(limit - len(results))
            .all()
        )
        for p in kw_papers:
            if any(r.paper_id == p.id for r in results):
                continue
            if venue and p.venue and venue.lower() not in p.venue.lower():
                continue
            if year and p.publication_year and p.publication_year != year:
                continue
            results.append(
                SearchResultItem(
                    paper_id=p.id,
                    paper_title=p.title,
                    venue=p.venue,
                    publication_year=p.publication_year,
                    chunk_index=0,
                    page_number=1,
                    section_name="Abstract",
                    content_snippet=(p.abstract or p.title)[:300],
                    relevance_score=0.70,
                )
            )

    return SearchResponse(
        query=q,
        total_results=len(results),
        results=results,
    )
