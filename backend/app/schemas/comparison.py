from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict, Field


class ComparisonRequest(BaseModel):
    paper_ids: List[str] = Field(..., min_length=2, max_length=5, examples=[["id-1", "id-2"]])


class ComparisonMatrixRow(BaseModel):
    aspect: str
    paper_comparisons: Dict[str, str]
    analysis: Optional[str] = None
    winner_or_edge: Optional[str] = None


class ComparisonOut(BaseModel):
    id: Optional[str] = None
    paper_ids: List[str]
    paper_titles: List[str]
    synthesis: str
    matrix: List[ComparisonMatrixRow]
    research_gaps: List[str]
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
