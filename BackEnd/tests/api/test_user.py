from unittest.mock import Mock, patch
from fastapi.testclient import TestClient
from fastapi import status

from app.main import app
from app.core.database import get_db
from app.api.user import get_current_active_user

# ? =============================================================
client = TestClient(app)

# ? =============================================================
def override_get_db():
    return Mock()

app.dependency_overrides[get_db] = override_get_db

# ? =============================================================
from datetime import datetime

@patch("app.api.user.check_user_existe")
@patch("app.api.user.create_user")
def test_register_user_success(mock_create_user, mock_check_user):
    mock_check_user.return_value = None

    mock_user = Mock()
    mock_user.id = 1
    mock_user.email = "test@mail.com"
    mock_user.username = "testuser"
    mock_user.role = "USER"
    mock_user.is_active = False
    mock_user.created_at = datetime.utcnow()

    mock_create_user.return_value = mock_user

    response = client.post(
        "/api/v1/users/register",
        json={
            "email": "test@mail.com",
            "username": "testuser",
            "password": "123456",
            "password_repeat": "123456",
            "role": "USER"
        }
    )

    assert response.status_code == status.HTTP_201_CREATED
    assert response.json()["email"] == "test@mail.com"

# ? =============================================================
@patch("app.api.user.check_user_existe")
def test_register_user_already_exists(mock_check_user):
    mock_check_user.return_value = True

    response = client.post(
        "/api/v1/users/register",
        json={
            "email": "test@mail.com",
            "username": "testuser",
            "password": "123456",
            "password_repeat": "123456",
            "role": "USER"
        }
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "already exists" in response.json()["detail"]

# ? =============================================================
@patch("app.api.user.create_access_token")
@patch("app.api.user.update_activation_user")
@patch("app.api.user.verify_password")
@patch("app.api.user.get_user_by_username")
def test_login_success(
    mock_get_user,
    mock_verify,
    mock_update,
    mock_create_token
):
    mock_user = Mock()
    mock_user.username = "testuser"
    mock_user.password_hash = "hashed"

    mock_get_user.return_value = mock_user
    mock_verify.return_value = True
    mock_update.return_value = mock_user
    mock_create_token.return_value = "fake_token"

    response = client.post(
        "/api/v1/users/login",
        data={
            "username": "testuser",
            "password": "123456"
        }
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["access_token"] == "fake_token"
    assert response.json()["token_type"] == "bearer"

# ? =============================================================
@patch("app.api.user.get_user_by_username")
@patch("app.api.user.verify_password")
def test_login_wrong_password(mock_verify, mock_get_user):
    mock_user = Mock()
    mock_user.password_hash = "hashed"

    mock_get_user.return_value = mock_user
    mock_verify.return_value = False

    response = client.post(
        "/api/v1/users/login",
        data={
            "username": "testuser",
            "password": "wrong"
        }
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Incorrect username or password" in response.json()["detail"]

# ? =============================================================
@patch("app.api.user.get_user_by_username")
def test_login_user_not_found(mock_get_user):
    mock_get_user.return_value = None

    response = client.post(
        "/api/v1/users/login",
        data={
            "username": "unknown",
            "password": "123456"
        }
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED

# ? =============================================================
from datetime import datetime
from app.core.deps import get_current_active_user
import pytest

def override_current_user():
    mock_user = Mock()
    mock_user.id = 1
    mock_user.email = "test@mail.com"
    mock_user.username = "testuser"
    mock_user.role = "USER"
    mock_user.is_active = True
    mock_user.created_at = datetime.utcnow()
    return mock_user


@pytest.fixture(autouse=True)
def override_user_dependency():
    app.dependency_overrides[get_current_active_user] = override_current_user
    yield
    app.dependency_overrides.clear()


@patch("app.api.user.update_activation_user")
def test_logout_success(mock_update):

    mock_user = Mock()
    mock_user.id = 1
    mock_user.email = "test@mail.com"
    mock_user.username = "testuser"
    mock_user.role = "USER"
    mock_user.is_active = False
    mock_user.created_at = datetime.utcnow()

    mock_update.return_value = mock_user

    response = client.post("/api/v1/users/logout")

    assert response.status_code == status.HTTP_201_CREATED