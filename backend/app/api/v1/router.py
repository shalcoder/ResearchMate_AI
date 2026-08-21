from fastapi import APIRouter
from app.api.v1.endpoints import admin, auth, professor, users

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users & RBAC"])
api_router.include_router(professor.router, prefix="/professor", tags=["Professor Advisory"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin Governance"])
