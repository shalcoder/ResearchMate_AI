from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class PaperBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, examples=["Attention Is All You Need"])
    abstract: Optional[str] = Field(None, examples=["The dominant sequence transduction models are based..."])
    authors: List[str] = Field(default_factory=list, examples=[["Ashish Vaswani", "Noam Shazeer"]])
    publication_year: Optional[int] = Field(None, examples=[2017])
    venue: Optional[str] = Field(None, examples=["NeurIPS"])
    doi: Optional[str] = Field(None, examples=["10.48550/arXiv.1706.03762"])


class PaperCreate(PaperBase):
    pass


class PaperChunkOut(BaseModel):
    id: str
    paper_id: str
    chunk_index: int
    section_name: str
    content: str
    token_count: int
    page_number: int
    chroma_id: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaperSummaryOut(BaseModel):
    id: str
    paper_id: str
    executive_summary: str
    key_findings: List[str]
    methodology: Optional[str] = None
    limitations: List[str]
    future_scope: List[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaperOut(PaperBase):
    id: str
    file_path: str
    file_size: int
    total_pages: int
    total_chunks: int
    owner_id: str
    created_at: datetime
    updated_at: datetime
    summary: Optional[PaperSummaryOut] = None

    model_config = ConfigDict(from_attributes=True)


class PaperUploadResponse(BaseModel):
    message: str
    paper: PaperOut
    extracted_chunks: int
    processed_pages: int
