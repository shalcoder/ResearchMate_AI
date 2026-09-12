from datetime import datetime, timezone
import uuid
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from app.core.database import Base


class PaperNote(Base):
    __tablename__ = "paper_notes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    paper_id = Column(String(36), ForeignKey("research_papers.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    page_number = Column(Integer, default=1, nullable=False)
    selected_text = Column(Text, nullable=True)
    note_text = Column(Text, nullable=False)
    color = Column(String(30), default="#facc15", nullable=False)  # yellow highlight default
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
