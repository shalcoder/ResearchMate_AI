import pytest
from app.models.user import UserRole


def test_admin_access_to_analytics(client, user_tokens):
    # Admin can access admin analytics
    admin_headers = user_tokens["admin"]["headers"]
    response = client.get("/api/v1/admin/analytics", headers=admin_headers)
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_non_admin_cannot_access_admin_analytics(client, user_tokens):
    # Student, Researcher, Professor must receive 403 Forbidden
    non_admin_roles = ["student", "researcher", "professor"]
    for role in non_admin_roles:
        headers = user_tokens[role]["headers"]
        response = client.get("/api/v1/admin/analytics", headers=headers)
        assert response.status_code == 403
        assert "Access denied" in response.json()["detail"]


def test_professor_student_supervision_access(client, user_tokens):
    # Professor can access supervised students
    prof_headers = user_tokens["professor"]["headers"]
    response = client.get("/api/v1/professor/students", headers=prof_headers)
    assert response.status_code == 200

    # Student cannot access professor student supervision endpoint
    student_headers = user_tokens["student"]["headers"]
    response = client.get("/api/v1/professor/students", headers=student_headers)
    assert response.status_code == 403


def test_admin_can_update_user_roles(client, user_tokens, db_session):
    admin_headers = user_tokens["admin"]["headers"]
    target_user_id = user_tokens["student"]["user"].id

    update_payload = {"role": "researcher"}
    response = client.patch(
        f"/api/v1/users/{target_user_id}/role",
        json=update_payload,
        headers=admin_headers,
    )
    assert response.status_code == 200
    assert response.json()["role"] == "researcher"


def test_non_admin_cannot_update_roles(client, user_tokens):
    student_headers = user_tokens["student"]["headers"]
    target_user_id = user_tokens["student"]["user"].id

    update_payload = {"role": "admin"}
    response = client.patch(
        f"/api/v1/users/{target_user_id}/role",
        json=update_payload,
        headers=student_headers,
    )
    assert response.status_code == 403
