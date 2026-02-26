from unittest.mock import Mock
from app.repositories.query_repository import (
    create_query_log,
    get_user_history,
    get_all_history,
    get_user_stats,
    get_global_stats
)
from app.models.query import Query
from app.models.user import User


# =======================================================
def test_create_query_log():
    mock_db = Mock()

    result = create_query_log(
        mock_db,
        query="What is AI?",
        response="Artificial Intelligence",
        user_id=1
    )

    mock_db.add.assert_called_once()
    mock_db.commit.assert_called_once()
    mock_db.refresh.assert_called_once_with(result)

    assert result.query == "What is AI?"
    assert result.response == "Artificial Intelligence"
    assert result.user_id == 1
    
# =======================================================
def test_get_user_history():
    mock_db = Mock()

    mock_db.query.return_value.filter.return_value.order_by.return_value.all.return_value = [
        "query1", "query2"
    ]

    result = get_user_history(mock_db, user_id=1)

    assert result == ["query1", "query2"]
    mock_db.query.assert_called_once()
    
# =======================================================
def test_get_all_history():
    mock_db = Mock()

    mock_db.query.return_value.order_by.return_value.all.return_value = [
        "q1", "q2"
    ]

    result = get_all_history(mock_db)

    assert result == ["q1", "q2"]
    
# =======================================================
def test_get_user_stats_with_activity():
    mock_db = Mock()

    mock_last_query = Mock()
    mock_last_query.created_at = "2024-01-01"

    mock_db.query.return_value.filter.return_value.count.return_value = 5
    mock_db.query.return_value.filter.return_value.order_by.return_value.first.return_value = mock_last_query

    result = get_user_stats(mock_db, user_id=1)

    assert result["total_queries"] == 5
    assert result["last_active"] == "2024-01-01"
    
# =======================================================
def test_get_user_stats_without_activity():
    mock_db = Mock()

    mock_db.query.return_value.filter.return_value.count.return_value = 0
    mock_db.query.return_value.filter.return_value.order_by.return_value.first.return_value = None

    result = get_user_stats(mock_db, user_id=1)

    assert result["total_queries"] == 0
    assert result["last_active"] is None
    
# =======================================================
def test_get_global_stats():
    mock_db = Mock()

    # total queries
    mock_db.query.return_value.count.return_value = 20

    # active users
    mock_db.query.return_value.filter.return_value.distinct.return_value.count.return_value = 3

    # frequent questions
    mock_db.query.return_value.group_by.return_value.order_by.return_value.limit.return_value.all.return_value = [
        ("What is AI?", 10),
        ("What is ML?", 5)
    ]

    result = get_global_stats(mock_db)

    assert result["total_queries"] == 20
    assert result["active_users_count"] == 3
    assert result["frequent_questions"] == [
        {"question": "What is AI?", "count": 10},
        {"question": "What is ML?", "count": 5}
    ]
    
