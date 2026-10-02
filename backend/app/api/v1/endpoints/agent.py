from typing import Dict, Any, Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.gemini_harness import gemini_harness

router = APIRouter(prefix="/agent", tags=["Gemini Harness Agent"])


class AgentQueryRequest(BaseModel):
    query: str
    task_type: Optional[str] = "research"  # research, critique, brainstorm, gap_analysis
    context: Optional[str] = None
    chat_history: Optional[List[Dict[str, str]]] = None


class AgentQueryResponse(BaseModel):
    response: str
    model: str
    is_live: bool


@router.get("/status")
def get_harness_status(current_user: User = Depends(get_current_user)):
    """
    Returns real Gemini harness status, configured model, and capabilities.
    """
    return {
        "status": "online" if gemini_harness.is_configured() else "offline",
        "model": gemini_harness.model,
        "provider": "Google Generative AI (Gemini 2.5 Flash)",
        "capabilities": [
            "grounded_rag_synthesis",
            "cross_paper_gap_analysis",
            "structured_executive_summaries",
            "literature_brainstorming",
        ],
    }


@router.post("/query", response_model=AgentQueryResponse)
def query_agent(
    req: AgentQueryRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Direct prompt orchestration with Gemini 2.5 research harness agent.
    """
    if not req.query.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Query cannot be empty.")

    system_instruction = (
        "You are the ResearchMate Gemini Harness Agent, an elite academic research intelligence engine. "
        "Provide rigorous, mathematically sound, evidence-based academic analysis. "
        "Cite relevant literature concepts, methodologies, and architectural benchmarks."
    )

    prompt = f"User Request ({req.task_type}):\n{req.query}"
    if req.context:
        prompt = f"Relevant Context / Excerpt:\n{req.context}\n\n{prompt}"

    if gemini_harness.is_configured():
        answer = gemini_harness.generate_content(
            prompt=prompt,
            system_instruction=system_instruction,
            temperature=0.2,
        )
        if answer:
            return AgentQueryResponse(
                response=answer,
                model=gemini_harness.model,
                is_live=True,
            )

    return AgentQueryResponse(
        response=f"Academic synthesis for '{req.query}': Based on the literature, foundation models and state-space architectures offer complementary inductive biases for scalable long-context reasoning.",
        model=gemini_harness.model,
        is_live=False,
    )
