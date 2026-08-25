from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.models.user import User
from app.schemas.user import UserRegisterRequest, UserResponse
from app.core.security import hash_password

router = APIRouter()


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Create a new user account with hashed password and role assignment."
)
def register_user(
    user_in: UserRegisterRequest,
    db: Session = Depends(get_db)
):
    # Check if a user with this email already exists
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered"
        )

    # Hash the password securely
    hashed_pwd = hash_password(user_in.password)

    # Create new User model instance
    db_user = User(
        name=user_in.name,
        email=user_in.email,
        password_hash=hashed_pwd,
        role=user_in.role.value
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user
