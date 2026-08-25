import pytest
from app.models.user import User
from app.core.security import verify_password


def test_register_user_success(client, db_session):
    payload = {
        "name": "Jane Researcher",
        "email": "jane.researcher@example.com",
        "password": "SecurePassword123!",
        "role": "researcher"
    }
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    
    # Check response fields
    assert "user_id" in data
    assert data["name"] == "Jane Researcher"
    assert data["email"] == "jane.researcher@example.com"
    assert data["role"] == "researcher"
    assert data["is_active"] is True
    assert "created_at" in data
    assert "password" not in data
    assert "password_hash" not in data

    # Verify persistence in database
    user_in_db = db_session.query(User).filter(User.email == "jane.researcher@example.com").first()
    assert user_in_db is not None
    assert user_in_db.name == "Jane Researcher"
    assert user_in_db.password_hash != "SecurePassword123!"
    assert verify_password("SecurePassword123!", user_in_db.password_hash) is True


def test_register_user_default_role(client):
    payload = {
        "name": "Student User",
        "email": "student@example.com",
        "password": "StudentPass123@"
    }
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["role"] == "student"


def test_register_duplicate_email(client):
    payload = {
        "name": "First User",
        "email": "duplicate@example.com",
        "password": "ValidPassword123#",
        "role": "student"
    }
    # First registration should succeed
    res1 = client.post("/auth/register", json=payload)
    assert res1.status_code == 201

    # Second registration with same email should fail with 409
    res2 = client.post("/auth/register", json=payload)
    assert res2.status_code == 409
    assert "already registered" in res2.json()["detail"].lower()


def test_register_duplicate_email_case_insensitive(client):
    payload1 = {
        "name": "Case User 1",
        "email": "case.sensitive@example.com",
        "password": "ValidPassword123#"
    }
    payload2 = {
        "name": "Case User 2",
        "email": "CASE.SENSITIVE@EXAMPLE.COM",
        "password": "ValidPassword123#"
    }
    res1 = client.post("/auth/register", json=payload1)
    assert res1.status_code == 201

    res2 = client.post("/auth/register", json=payload2)
    assert res2.status_code == 409


@pytest.mark.parametrize("weak_password,expected_error", [
    ("Short1!", "at least 8 characters"),
    ("alllowercase123!", "uppercase"),
    ("ALLUPPERCASE123!", "lowercase"),
    ("NoNumbersHere!", "number"),
    ("NoSpecialChar123", "special character"),
])
def test_register_weak_passwords(client, weak_password, expected_error):
    payload = {
        "name": "Test User",
        "email": "weakpass@example.com",
        "password": weak_password
    }
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 422
    assert expected_error.lower() in response.text.lower()


def test_register_invalid_email(client):
    payload = {
        "name": "Bad Email User",
        "email": "not-an-email",
        "password": "ValidPassword123!"
    }
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 422


def test_register_empty_name(client):
    payload = {
        "name": "   ",
        "email": "user@example.com",
        "password": "ValidPassword123!"
    }
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 422


def test_register_invalid_role(client):
    payload = {
        "name": "Test User",
        "email": "user@example.com",
        "password": "ValidPassword123!",
        "role": "superadmin"
    }
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 422


def test_api_v1_versioned_endpoint(client):
    payload = {
        "name": "V1 User",
        "email": "v1user@example.com",
        "password": "ValidPassword123!",
        "role": "professor"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    assert response.json()["role"] == "professor"


def test_health_and_root_endpoints(client):
    res_root = client.get("/")
    assert res_root.status_code == 200
    assert res_root.json()["status"] == "online"

    res_health = client.get("/health")
    assert res_health.status_code == 200
    assert res_health.json()["status"] == "healthy"
