from typing import List, Optional
from pydantic import BaseModel, Field


class SearchQueryRequest(BaseModel):
    query: str = Field(..., min_length=1, examples=["attention mechanism sequence to sequence"])
    venue: Optional[str] = None
    publication_year: Optional[int] = None
    limit: int = Field(10, ge=1, le=50)


class SearchResultItem(BaseModel):
    paper_id: str
    paper_title: str
    venue: Optional[str] = None
    publication_year: Optional[int] = None
    chunk_index: int
    page_number: int
    section_name: str
    content_snippet: str
    relevance_score: float


class SearchResponse(BaseModel):
    query: str
    total_results: int
    results: List[SearchResultItem]
