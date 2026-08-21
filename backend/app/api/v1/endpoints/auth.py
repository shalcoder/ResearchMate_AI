from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.core.security import (
    create_access_token,
    get_password_hash,
    verify_password,
)
from app.models.user import User
from app.schemas.user import (
    LoginRequest,
    MessageResponse,
    Token,
    UserCreate,
    UserOut,
)

router = APIRouter()


@router.post(
    "/register",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new research user",
    description="Registers a new student, researcher, professor, or admin account with securely hashed credentials.",
)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # 1. Check for duplicate email
    existing_user = db.query(User).filter(User.email == user_in.email.lower().strip()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"An account with email '{user_in.email}' already exists. Please login instead.",
        )

    # 2. Hash password securely
    hashed_password = get_password_hash(user_in.password)

    # 3. Create user record
    new_user = User(
        name=user_in.name.strip(),
        email=user_in.email.lower().strip(),
        hashed_password=hashed_password,
        role=user_in.role,
        department=user_in.department,
        institution=user_in.institution,
        is_active=True,
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register user due to a database error.",
        )


@router.post(
    "/login",
    response_model=Token,
    summary="Authenticate user and issue JWT",
    description="Verifies user credentials and returns a signed JWT token with role claims.",
)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email.lower().strip()).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is deactivated",
        )

    # Issue JWT token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(
        subject=user.id,
        role=user.role.value,
        email=user.email,
        name=user.name,
        expires_delta=access_token_expires,
    )

    return Token(
        access_token=token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=user,
    )


@router.get(
    "/me",
    response_model=UserOut,
    summary="Get current authenticated user profile",
    description="Returns the profile and role details of the currently authenticated user.",
)
def get_me(current_user: User = Depends(get_current_active_user)):
    return current_user


@router.post(
    "/logout",
    response_model=MessageResponse,
    summary="Logout user session",
    description="Confirms user logout; client removes cached JWT bearer token.",
)
def logout(current_user: User = Depends(get_current_active_user)):
    return MessageResponse(
        message="Successfully logged out",
        detail=f"Session for user '{current_user.email}' terminated.",
    )
