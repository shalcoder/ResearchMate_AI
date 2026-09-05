from datetime import datetime, timezone
import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON
from app.core.database import Base


class PaperComparison(Base):
    __tablename__ = "paper_comparisons"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    paper_ids = Column(JSON, default=list, nullable=False)
    paper_titles = Column(JSON, default=list, nullable=False)
    synthesis = Column(Text, nullable=False)
    matrix = Column(JSON, default=list, nullable=False)
    research_gaps = Column(JSON, default=list, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
