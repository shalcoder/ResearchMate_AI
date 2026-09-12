from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class NoteCreate(BaseModel):
    paper_id: str
    page_number: int = Field(1, ge=1)
    selected_text: Optional[str] = None
    note_text: str = Field(..., min_length=1)
    color: Optional[str] = "#facc15"


class NoteUpdate(BaseModel):
    note_text: Optional[str] = None
    color: Optional[str] = None


class NoteOut(BaseModel):
    id: str
    paper_id: str
    user_id: str
    page_number: int
    selected_text: Optional[str] = None
    note_text: str
    color: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
