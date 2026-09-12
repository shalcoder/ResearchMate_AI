from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class CitationGenerateRequest(BaseModel):
    paper_id: str
    format: Optional[str] = Field("apa", examples=["apa", "mla", "ieee", "harvard", "chicago", "bibtex"])


class CitationAllFormatsResponse(BaseModel):
    paper_id: str
    paper_title: str
    apa: str
    mla: str
    ieee: str
    harvard: str
    chicago: str
    bibtex: str


class CitationExportOut(BaseModel):
    id: str
    paper_id: str
    format: str
    citation_text: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
