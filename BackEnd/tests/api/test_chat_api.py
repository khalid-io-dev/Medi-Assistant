import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from datetime import datetime

from app.main import app
from app.models.user import User
from app.core.deps import get_current_active_user

client = TestClient(app)


def override_get_current_user():
    return User(id=1, username="testuser", email="test@test.com", is_active=True)


@pytest.fixture(autouse=True)
def override_dependencies():
    app.dependency_overrides[get_current_active_user] = override_get_current_user
    yield
    app.dependency_overrides.clear()


# ==============================
@patch("app.api.chat.create_query_log")
@patch("app.api.chat.service_ask_question")
def test_ask_question(mock_service, mock_create_log):

    mock_service.return_value = {
        "answer": "This is a test response",
        "sources": []
    }

    response = client.post(
        "/api/v1/chat/",
        json={"question": "Hello?"}
    )

    assert response.status_code == 200
    assert response.json()["answer"] == "This is a test response"

    mock_create_log.assert_called_once()


# ==============================
@patch("app.api.chat.get_user_history")
def test_get_my_history(mock_history):

    mock_history.return_value = [
        {
            "id": 1,
            "query": "Hello",
            "response": "Hi",
            "user_id": 1,
            "created_at": datetime.utcnow()
        }
    ]

    response = client.get("/api/v1/chat/history/1")

    assert response.status_code == 200
    assert len(response.json()) == 1


# ==============================
@patch("app.api.chat.get_user_stats")
def test_get_my_stats(mock_stats):

    mock_stats.return_value = {
        "total_queries": 10,
        "success_rate": 0.95
    }

    response = client.get("/api/v1/chat/stats")

    assert response.status_code == 200
    assert response.json()["total_queries"] == 10