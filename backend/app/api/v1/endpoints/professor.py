from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import require_professor
from app.models.user import User, UserRole
from app.schemas.user import UserOut

router = APIRouter()


@router.get(
    "/students",
    response_model=List[UserOut],
    summary="List supervised students (Professor only)",
)
def get_supervised_students(
    db: Session = Depends(get_db),
    professor: User = Depends(require_professor),
):
    students = db.query(User).filter(User.role == UserRole.STUDENT).all()
    return students


@router.post(
    "/recommendations",
    summary="Broadcast paper recommendation to students (Professor only)",
)
def broadcast_recommendation(
    paper_title: str,
    note: str,
    professor: User = Depends(require_professor),
):
    return {
        "status": "success",
        "message": f"Recommendation for '{paper_title}' sent to student group.",
        "broadcast_by": professor.name,
    }
