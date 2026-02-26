import os
import sys


sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from unittest.mock import MagicMock
from app.repositories.user_repository import update_activation_user
from app.schemas.user import UserUpdate

def test_update_activation_user():
    db = MagicMock()
    query_mock = MagicMock()
    db.query.return_value = query_mock
    query_mock.filter.return_value = query_mock
    
    # Mock a found user
    db_user = MagicMock()
    db_user.is_active = False
    query_mock.first.return_value = db_user
    
    update_data = UserUpdate(username="testuser")
    
    result = update_activation_user(db, update_data, is_active=True)
    
    print(f"User found: {result is not None}")
    if result:
        print(f"User is_active after update: {result.is_active}")
        
    db.commit.assert_called_once()
    db.refresh.assert_called_once_with(db_user)
    
    if result and result.is_active == True:
        print("SUCCESS: User activation updated correctly.")
    else:
        print("FAIL: User activation not updated correctly.")
        sys.exit(1)

if __name__ == "__main__":
    test_update_activation_user()
