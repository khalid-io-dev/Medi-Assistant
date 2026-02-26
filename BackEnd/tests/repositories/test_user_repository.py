from unittest.mock import Mock, patch

from app.repositories.user_repository import (
    get_user_by_username,
    get_user_by_id,
    get_all_users,
    update_activation_user,
    update_activation_user,
    update_activation_user,
    check_user_existe,
    create_user)
from app.models.user import User as User_Model
from app.schemas.user import UserUpdate, UserCreate


# ? =======================================================
def test_check_user_existe():
    mock_db = Mock()

    mock_query = mock_db.query.return_value
    mock_filter = mock_query.filter.return_value
    mock_filter.first.return_value = "user_object"

    result = check_user_existe(mock_db, "test@mail.com", "username")

    assert result == "user_object"
    mock_db.query.assert_called_once()
    

# ? =======================================================
@patch("app.repositories.user_repository.hash_password")
def test_create_user(mock_hash_password):
    mock_db = Mock()
    mock_hash_password.return_value = "hashed_pw"

    user_data = UserCreate(
        email="test@mail.com",
        username="testuser",
        password="123456",              # >= 6 caractères
        password_repeat="123456",       # obligatoire
        role="user"
    )

    result = create_user(mock_db, user_data)

    mock_db.add.assert_called_once()
    mock_db.commit.assert_called_once()
    mock_db.refresh.assert_called_once()

    assert result.email == "test@mail.com"
    assert result.password_hash == "hashed_pw"
    assert result.is_active is False
    
    
# ? =======================================================


def test_get_user_by_username():
    mock_db = Mock()

    mock_db.query.return_value.filter.return_value.first.return_value = "user_obj"

    result = get_user_by_username(mock_db, "testuser")

    assert result == "user_obj"
    
    
# ? =======================================================


def test_get_user_by_id():
    mock_db = Mock()

    mock_db.query.return_value.filter.return_value.first.return_value = "user_obj"

    result = get_user_by_id(mock_db, 1)

    assert result == "user_obj"
    

# ? =======================================================


def test_get_all_users():
    mock_db = Mock()

    mock_db.query.return_value.all.return_value = ["user1", "user2"]

    result = get_all_users(mock_db)

    assert result == ["user1", "user2"]


# ? =======================================================


def test_update_activation_user_with_model():
    mock_db = Mock()

    user = Mock(spec=User_Model)
    user.username = "testuser"
    user.is_active = False

    result = update_activation_user(mock_db, user, is_active=True)

    assert result.is_active is True
    mock_db.commit.assert_called_once()
    mock_db.refresh.assert_called_once_with(user)    


# ? =======================================================


def test_update_activation_user_not_found():
    mock_db = Mock()

    mock_db.query.return_value.filter.return_value.first.return_value = None

    user_data = UserUpdate(
        username="unknown",
        email="unknown@mail.com"
    )

    result = update_activation_user(mock_db, user_data, is_active=True)

    assert result is None

# ? =======================================================


def test_update_activation_user_with_schema():
    mock_db = Mock()

    db_user = Mock()
    db_user.username = "testuser"
    db_user.is_active = False

    mock_db.query.return_value.filter.return_value.first.return_value = db_user

    user_data = UserUpdate(
        username="testuser",
        email="test@mail.com"
    )

    result = update_activation_user(mock_db, user_data, is_active=True)

    assert result.is_active is True
    mock_db.commit.assert_called_once()

# ? =======================================================