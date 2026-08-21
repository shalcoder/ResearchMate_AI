from typing import List, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User, UserRole
from app.schemas.user import TokenPayload

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


def get_current_user(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or authentication token is missing/expired",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not token:
        raise credentials_exception

    payload = decode_access_token(token)
    if not payload:
        raise credentials_exception

    user_id: Optional[str] = payload.get("sub")
    if not user_id:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise credentials_exception

    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account",
        )
    return current_user


def require_role(allowed_roles: List[UserRole]):
    """
    Dependency factory to enforce Role-Based Access Control (RBAC).
    Raises 403 FORBIDDEN if the authenticated user's role is not in allowed_roles.
    """
    def role_checker(current_user: User = Depends(get_current_active_user)) -> User:
        # Superusers or users possessing the required role pass
        if current_user.is_superuser or current_user.role in allowed_roles:
            return current_user

        role_names = ", ".join([r.value for r in allowed_roles])
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied: This operation requires [{role_names}] role. Current role: [{current_user.role.value}]",
        )

    return role_checker


# Convenient pre-configured role dependencies
require_admin = require_role([UserRole.ADMIN])
require_professor = require_role([UserRole.PROFESSOR, UserRole.ADMIN])
require_researcher = require_role([UserRole.RESEARCHER, UserRole.ADMIN])
require_student = require_role([UserRole.STUDENT, UserRole.RESEARCHER, UserRole.PROFESSOR, UserRole.ADMIN])
