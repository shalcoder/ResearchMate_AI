from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from app.models.user import UserRole


class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, examples=["Yashwanth Marimuthu"])
    email: EmailStr = Field(..., examples=["yashwanth@researchmate.ai"])
    role: UserRole = Field(default=UserRole.STUDENT, examples=["student"])
    department: Optional[str] = Field(None, max_length=150, examples=["Computer Science"])
    institution: Optional[str] = Field(None, max_length=150, examples=["Research University"])


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, examples=["SecurePass123!"])


class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[UserRole] = None
    department: Optional[str] = None
    institution: Optional[str] = None
    is_active: Optional[bool] = None


class UserRoleUpdate(BaseModel):
    role: UserRole = Field(..., examples=["researcher"])


class UserOut(UserBase):
    id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr = Field(..., examples=["yashwanth@researchmate.ai"])
    password: str = Field(..., examples=["SecurePass123!"])


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserOut


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[UserRole] = None
    email: Optional[str] = None
    name: Optional[str] = None
    exp: Optional[int] = None


class MessageResponse(BaseModel):
    message: str
    detail: Optional[str] = None
