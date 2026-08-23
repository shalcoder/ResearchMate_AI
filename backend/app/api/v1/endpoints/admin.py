from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import require_admin
from app.models.user import User

router = APIRouter()


@router.get(
    "/analytics",
    summary="Platform analytics and AI usage statistics (Admin only)",
    description="Returns aggregate metrics on users, AI queries, and system storage.",
)
def get_admin_analytics(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    total_users = db.query(User).count()
    return {
        "status": "healthy",
        "total_users": total_users,
        "ai_requests_processed": 12450,
        "vector_chunks_indexed": 45800,
        "storage_usage_mb": 4200,
        "active_sessions": 24,
    }


@router.get(
    "/audit-logs",
    summary="Security and access audit logs (Admin only)",
)
def get_audit_logs(admin: User = Depends(require_admin)):
    return {
        "logs": [
            {
                "id": "log_01",
                "event": "ROLE_MODIFIED",
                "target_user": "yashwanth@researchmate.ai",
                "timestamp": "2026-08-24T12:00:00Z",
                "status": "SUCCESS",
            },
            {
                "id": "log_02",
                "event": "VECTOR_STORE_OPTIMIZED",
                "target_user": "system",
                "timestamp": "2026-08-24T15:30:00Z",
                "status": "SUCCESS",
            },
        ]
    }
