import os
from typing import List
from pydantic import BaseModel


class Settings(BaseModel):
    PROJECT_NAME: str = "ResearchMate AI"
    API_V1_STR: str = "/api/v1"
    
    # CORS Origins
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]
    
    # Database
    # Default to sqlite in local workspace, can be overridden by DATABASE_URL env var
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./researchmate.db"
    )
    
    # JWT / Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "researchmate-super-secret-development-key-change-in-prod")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days


settings = Settings()
