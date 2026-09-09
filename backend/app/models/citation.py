from datetime import datetime, timezone
import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from app.core.database import Base


class CitationExport(Base):
    __tablename__ = "citation_exports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    paper_id = Column(String(36), ForeignKey("research_papers.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    format = Column(String(20), nullable=False)  # "apa", "mla", "ieee", "harvard", "chicago", "bibtex"
    citation_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
