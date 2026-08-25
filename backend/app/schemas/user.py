from enum import Enum
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict
from app.core.security import validate_password_strength


class UserRole(str, Enum):
    STUDENT = "student"
    RESEARCHER = "researcher"
    PROFESSOR = "professor"
    ADMIN = "admin"


class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Full name of the user")
    email: EmailStr = Field(..., description="Valid email address")
    password: str = Field(..., min_length=8, max_length=128, description="Strong password")
    role: UserRole = Field(default=UserRole.STUDENT, description="User role in the system")

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Name cannot be empty or only whitespace")
        return cleaned

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        is_valid, msg = validate_password_strength(v)
        if not is_valid:
            raise ValueError(msg)
        return v


class UserResponse(BaseModel):
    user_id: str
    name: str
    email: EmailStr
    role: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MessageResponse(BaseModel):
    message: str
