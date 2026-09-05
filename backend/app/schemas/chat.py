from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, ConfigDict, Field


class CitationOut(BaseModel):
    citation_id: str
    chunk_index: int
    page_number: int
    section_name: str
    excerpt: str
    relevance_score: Optional[float] = None


class ChatQueryRequest(BaseModel):
    query: str = Field(..., min_length=1, examples=["What are the main contributions of this paper?"])
    paper_id: Optional[str] = Field(None, examples=["b1234567-xxxx"])
    session_id: Optional[str] = None


class ChatQueryResponse(BaseModel):
    answer: str
    citations: List[CitationOut] = []
    retrieved_chunks: int = 0


class ChatMessageCreate(BaseModel):
    content: str = Field(..., min_length=1)


class ChatMessageOut(BaseModel):
    id: str
    session_id: str
    role: str
    content: str
    citations: List[Dict[str, Any]] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ChatSessionCreate(BaseModel):
    title: Optional[str] = Field("Academic Paper Q&A", max_length=255)
    paper_id: Optional[str] = None


class ChatSessionOut(BaseModel):
    id: str
    title: str
    paper_id: Optional[str] = None
    user_id: str
    created_at: datetime
    updated_at: datetime
    messages: List[ChatMessageOut] = []

    model_config = ConfigDict(from_attributes=True)
