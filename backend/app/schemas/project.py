from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.paper import PaperOut


class ProjectCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=200, examples=["Deep Learning Literature Review"])
    description: Optional[str] = Field(None, examples=["Collection of foundational attention and transformer papers"])


class ProjectPaperAdd(BaseModel):
    paper_id: str


class ProjectOut(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    owner_id: str
    created_at: datetime
    updated_at: datetime
    papers: List[PaperOut] = []

    model_config = ConfigDict(from_attributes=True)
