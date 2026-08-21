import pytest
from app.models.user import User, UserRole


def test_valid_user_registration(client, db_session):
    payload = {
        "name": "Yashwanth Marimuthu",
        "email": "yashwanth@researchmate.ai",
        "password": "SecurePassword123!",
        "role": "student",
        "department": "Computer Science",
        "institution": "Research University",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Yashwanth Marimuthu"
    assert data["email"] == "yashwanth@researchmate.ai"
    assert data["role"] == "student"
    assert "id" in data
    assert "hashed_password" not in data
    assert "password" not in data

    # Verify password in DB is hashed
    db_user = db_session.query(User).filter(User.email == "yashwanth@researchmate.ai").first()
    assert db_user is not None
    assert db_user.hashed_password != "SecurePassword123!"
    assert db_user.hashed_password.startswith("$2b$") or len(db_user.hashed_password) > 20


def test_duplicate_email_registration_rejected(client, create_test_user):
    create_test_user(email="duplicate@researchmate.ai")

    payload = {
        "name": "Duplicate User",
        "email": "duplicate@researchmate.ai",
        "password": "Password123!",
        "role": "researcher",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"].lower()


def test_registration_invalid_email(client):
    payload = {
        "name": "Invalid Email User",
        "email": "not-an-email",
        "password": "Password123!",
        "role": "student",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422


def test_registration_short_password(client):
    payload = {
        "name": "Short Pass User",
        "email": "shortpass@researchmate.ai",
        "password": "123",
        "role": "student",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422


def test_registration_all_supported_roles(client):
    roles = ["student", "researcher", "professor", "admin"]
    for role in roles:
        payload = {
            "name": f"Test {role.capitalize()}",
            "email": f"{role}@researchmate.ai",
            "password": "ValidPassword123!",
            "role": role,
        }
        response = client.post("/api/v1/auth/register", json=payload)
        assert response.status_code == 201
        assert response.json()["role"] == role
