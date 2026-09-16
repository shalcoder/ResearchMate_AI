from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field


class RoleDistribution(BaseModel):
    student: int = 0
    researcher: int = 0
    professor: int = 0
    admin: int = 0


class AdminMetricsResponse(BaseModel):
    status: str = "healthy"
    database_engine: str = "operational"
    total_users: int
    users_by_role: Dict[str, int]
    total_papers: int
    total_chunks: int
    total_chat_sessions: int
    total_comparisons: int
    total_projects: int
    token_usage_estimated: int
    active_sessions: int
    storage_usage_mb: float


class AuditLogItem(BaseModel):
    id: str
    event: str
    target: str
    actor: str
    timestamp: str
    status: str


class AuditLogsResponse(BaseModel):
    total_events: int
    logs: List[AuditLogItem]
