from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.paper import ResearchPaper
from app.models.note import PaperNote
from app.schemas.note import NoteCreate, NoteOut, NoteUpdate

router = APIRouter(prefix="/notes", tags=["Notes & Highlights"])


@router.post("", response_model=NoteOut, status_code=status.HTTP_201_CREATED)
def create_note(
    payload: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    paper = db.query(ResearchPaper).filter(ResearchPaper.id == payload.paper_id).first()
    if not paper:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Research paper not found.")

    note = PaperNote(
        paper_id=payload.paper_id,
        user_id=current_user.id,
        page_number=payload.page_number,
        selected_text=payload.selected_text,
        note_text=payload.note_text,
        color=payload.color or "#facc15",
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.get("/paper/{paper_id}", response_model=List[NoteOut])
def list_paper_notes(
    paper_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(PaperNote)
        .filter(PaperNote.paper_id == paper_id, PaperNote.user_id == current_user.id)
        .order_by(PaperNote.page_number.asc(), PaperNote.created_at.desc())
        .all()
    )


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    note_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = db.query(PaperNote).filter(PaperNote.id == note_id, PaperNote.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found.")
    db.delete(note)
    db.commit()
    return None
