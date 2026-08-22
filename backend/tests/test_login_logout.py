import pytest


def test_valid_user_login(client, create_test_user):
    create_test_user(
        email="login_user@researchmate.ai",
        password="MySecretPassword123!",
    )

    login_payload = {
        "email": "login_user@researchmate.ai",
        "password": "MySecretPassword123!",
    }
    response = client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "login_user@researchmate.ai"


def test_login_invalid_password(client, create_test_user):
    create_test_user(
        email="wrong_pass@researchmate.ai",
        password="CorrectPassword123!",
    )

    login_payload = {
        "email": "wrong_pass@researchmate.ai",
        "password": "WrongPassword456!",
    }
    response = client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]


def test_login_nonexistent_user(client):
    login_payload = {
        "email": "nonexistent@researchmate.ai",
        "password": "Password123!",
    }
    response = client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]


def test_authenticated_me_endpoint(client, user_tokens):
    headers = user_tokens["researcher"]["headers"]
    response = client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "researcher@researchmate.ai"
    assert data["role"] == "researcher"


def test_unauthenticated_request_rejected(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_logout_endpoint(client, user_tokens):
    headers = user_tokens["student"]["headers"]
    response = client.post("/api/v1/auth/logout", headers=headers)
    assert response.status_code == 200
    assert "Successfully logged out" in response.json()["message"]
