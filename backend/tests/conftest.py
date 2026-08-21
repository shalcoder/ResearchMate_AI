import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.core.database import Base, get_db
from app.core.security import create_access_token, get_password_hash
from app.models.user import User, UserRole
from main import app

# In-memory SQLite for high-speed isolated tests
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def create_test_user(db_session):
    def _create_user(
        name: str = "Test User",
        email: str = "test@researchmate.ai",
        password: str = "Password123!",
        role: UserRole = UserRole.STUDENT,
        is_active: bool = True,
        is_superuser: bool = False,
    ) -> User:
        user = User(
            name=name,
            email=email.lower().strip(),
            hashed_password=get_password_hash(password),
            role=role,
            is_active=is_active,
            is_superuser=is_superuser,
            department="Computer Science",
            institution="Research University",
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
        return user

    return _create_user


@pytest.fixture
def user_tokens(create_test_user):
    users = {
        "student": create_test_user(
            name="Student User",
            email="student@researchmate.ai",
            role=UserRole.STUDENT,
        ),
        "researcher": create_test_user(
            name="Researcher User",
            email="researcher@researchmate.ai",
            role=UserRole.RESEARCHER,
        ),
        "professor": create_test_user(
            name="Professor User",
            email="professor@researchmate.ai",
            role=UserRole.PROFESSOR,
        ),
        "admin": create_test_user(
            name="Admin User",
            email="admin@researchmate.ai",
            role=UserRole.ADMIN,
            is_superuser=True,
        ),
    }

    tokens = {}
    for role_key, user in users.items():
        token = create_access_token(
            subject=user.id,
            role=user.role.value,
            email=user.email,
            name=user.name,
        )
        tokens[role_key] = {
            "user": user,
            "token": token,
            "headers": {"Authorization": f"Bearer {token}"},
        }

    return tokens
