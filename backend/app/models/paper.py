from datetime import datetime, timezone
import uuid
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class ResearchPaper(Base):
    __tablename__ = "research_papers"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    title = Column(String(255), nullable=False, index=True)
    abstract = Column(Text, nullable=True)
    authors = Column(JSON, default=list, nullable=False)  # list of author strings
    publication_year = Column(Integer, nullable=True)
    venue = Column(String(255), nullable=True)
    doi = Column(String(100), nullable=True, index=True)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, default=0, nullable=False)
    total_pages = Column(Integer, default=1, nullable=False)
    total_chunks = Column(Integer, default=0, nullable=False)
    owner_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    chunks = relationship("PaperChunk", back_populates="paper", cascade="all, delete-orphan")
    summary = relationship("PaperSummary", back_populates="paper", uselist=False, cascade="all, delete-orphan")


class PaperChunk(Base):
    __tablename__ = "paper_chunks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    paper_id = Column(String(36), ForeignKey("research_papers.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)
    section_name = Column(String(100), default="Body", nullable=False)
    content = Column(Text, nullable=False)
    token_count = Column(Integer, default=0, nullable=False)
    page_number = Column(Integer, default=1, nullable=False)
    chroma_id = Column(String(100), nullable=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    paper = relationship("ResearchPaper", back_populates="chunks")


class PaperSummary(Base):
    __tablename__ = "paper_summaries"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    paper_id = Column(String(36), ForeignKey("research_papers.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    executive_summary = Column(Text, nullable=False)
    key_findings = Column(JSON, default=list, nullable=False)
    methodology = Column(Text, nullable=True)
    limitations = Column(JSON, default=list, nullable=False)
    future_scope = Column(JSON, default=list, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    paper = relationship("ResearchPaper", back_populates="summary")
