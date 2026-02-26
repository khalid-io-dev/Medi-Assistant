# tests/test_admin_routes.py

from unittest.mock import Mock, patch
from fastapi.testclient import TestClient
from datetime import datetime

from app.main import app
from app.core.deps import get_current_admin_user
from app.core.database import get_db

# ? =============================================================
client = TestClient(app)


# ? =============================================================
def override_admin_user():
    admin = Mock()
    admin.id = 1
    admin.email = "admin@mail.com"
    admin.username = "admin"
    admin.role = "ADMIN"
    admin.is_active = True
    return admin

app.dependency_overrides[get_current_admin_user] = override_admin_user

# ? =============================================================
def override_get_db():
    db = Mock()
    yield db

app.dependency_overrides[get_db] = override_get_db

# ? =============================================================
@patch("app.api.admin.get_global_stats")
def test_get_stats(mock_stats):

    mock_stats.return_value = {
        "total_users": 10,
        "total_queries": 50
    }

    response = client.get("/api/v1/admin/stats")

    assert response.status_code == 200
    assert response.json()["total_users"] == 10

# ? =============================================================
@patch("app.api.admin.get_all_history")
def test_get_global_history(mock_history):

    mock_history.return_value = [
        {
            "id": 1,
            "query": "Hello",
            "response": "Hi",
            "user_id": 1,
            "created_at": datetime.utcnow().isoformat()
        }
    ]

    response = client.get("/api/v1/admin/history")

    assert response.status_code == 200
    assert len(response.json()) == 1

# ? =============================================================
@patch("app.api.admin.get_all_users")
def test_get_all_users_admin(mock_users):

    mock_users.return_value = [
        {
            "id": 1,
            "email": "user@mail.com",
            "username": "user1",
            "role": "USER",
            "is_active": True,
            "created_at": datetime.utcnow().isoformat()
        },
        {
            "id": 2,
            "email": "user2@mail.com",
            "username": "user2",
            "role": "USER",
            "is_active": True,
            "created_at": datetime.utcnow().isoformat()
        }
    ]

    response = client.get("/api/v1/admin/all-users")

    assert response.status_code == 200
    assert response.json()[0]["email"] == "user@mail.com"

# ? =============================================================
@patch("app.api.admin.get_user_history")
def test_get_specific_user_history(mock_history):

    mock_history.return_value = [
        {
            "id": 2,
            "query": "Test",
            "response": "Answer",
            "user_id": 5,
            "created_at": datetime.utcnow().isoformat()
        }
    ]

    response = client.get("/api/v1/admin/users/5/history")

    assert response.status_code == 200
    assert response.json()[0]["user_id"] == 5

# ? =============================================================


