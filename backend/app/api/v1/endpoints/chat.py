from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.paper import ResearchPaper
from app.models.chat import ChatSession, ChatMessage
from app.schemas.chat import (
    ChatQueryRequest,
    ChatQueryResponse,
    ChatSessionCreate,
    ChatSessionOut,
    ChatMessageCreate,
    ChatMessageOut,
)
from app.services.rag_service import rag_service

router = APIRouter(prefix="/chat", tags=["Grounded RAG Chat"])


@router.post("/query", response_model=ChatQueryResponse)
def query_rag(
    payload: ChatQueryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Direct RAG query endpoint.
    Retrieves grounded evidence from ChromaDB vector chunks and generates cited response.
    """
    history = []
    if payload.session_id:
        session = db.query(ChatSession).filter(ChatSession.id == payload.session_id).first()
        if session:
            recent_msgs = db.query(ChatMessage).filter(ChatMessage.session_id == session.id).order_by(ChatMessage.created_at.desc()).limit(6).all()
            history = [{"role": m.role, "content": m.content} for m in reversed(recent_msgs)]

    result = rag_service.answer_query(
        query=payload.query,
        paper_id=payload.paper_id,
        chat_history=history,
    )

    return ChatQueryResponse(
        answer=result["answer"],
        citations=result["citations"],
        retrieved_chunks=result["retrieved_chunks"],
    )


@router.post("/sessions", response_model=ChatSessionOut, status_code=status.HTTP_201_CREATED)
def create_chat_session(
    payload: ChatSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.paper_id:
        paper = db.query(ResearchPaper).filter(ResearchPaper.id == payload.paper_id).first()
        if not paper:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target paper not found.")
        title = payload.title or f"Chat: {paper.title[:50]}"
    else:
        title = payload.title or "General Literature Chat"

    session = ChatSession(
        title=title,
        paper_id=payload.paper_id,
        user_id=current_user.id,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.get("/sessions", response_model=List[ChatSessionOut])
def list_chat_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(ChatSession)
        .filter(ChatSession.user_id == current_user.id)
        .order_by(ChatSession.updated_at.desc())
        .all()
    )


@router.get("/sessions/{session_id}", response_model=ChatSessionOut)
def get_chat_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = (
        db.query(ChatSession)
        .filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found.")
    return session


@router.post("/sessions/{session_id}/messages", response_model=ChatMessageOut)
def send_session_message(
    session_id: str,
    payload: ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = (
        db.query(ChatSession)
        .filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found.")

    # 1. Save user message
    user_msg = ChatMessage(
        session_id=session.id,
        role="user",
        content=payload.content,
    )
    db.add(user_msg)
    db.flush()

    # 2. Gather history
    recent_msgs = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session.id)
        .order_by(ChatMessage.created_at.desc())
        .limit(6)
        .all()
    )
    history = [{"role": m.role, "content": m.content} for m in reversed(recent_msgs)]

    # 3. Formulate RAG answer
    rag_result = rag_service.answer_query(
        query=payload.content,
        paper_id=session.paper_id,
        chat_history=history,
    )

    # 4. Save assistant response
    assistant_msg = ChatMessage(
        session_id=session.id,
        role="assistant",
        content=rag_result["answer"],
        citations=rag_result["citations"],
    )
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)
    return assistant_msg
