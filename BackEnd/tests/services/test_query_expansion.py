from unittest.mock import patch, Mock
from app.services.query_expansion import QueryExpander
from app.core.config import settings


# ? ==========================================================
def test_expand_query_success():
    expander = QueryExpander()

    # Mock du résultat LLM
    expander.chain = Mock()
    expander.chain.invoke.return_value = [
        "clinical variant one",
        "clinical variant two",
        "clinical variant three"
    ]

    query = "diabetes treatment"
    results = expander.expand_query(query)

    assert results[0] == query
    assert len(results) == 1 + settings.QUERY_EXPANSION_COUNT
    assert "clinical variant one" in results
    
    
# ? ==========================================================
def test_expand_query_filters_empty_strings():
    expander = QueryExpander()

    expander.chain = Mock()
    expander.chain.invoke.return_value = [
        "  variant one  ",
        "",
        "   ",
        "variant two"
    ]

    query = "hypertension"
    results = expander.expand_query(query)

    assert results[0] == query
    assert "variant one" in results
    assert "variant two" in results
    assert len(results) == 3
    
# ? ==========================================================
def test_expand_query_respects_limit():
    expander = QueryExpander()

    expander.chain = Mock()
    expander.chain.invoke.return_value = [
        "v1", "v2", "v3", "v4", "v5"
    ]

    query = "asthma"
    results = expander.expand_query(query)

    assert len(results) == 1 + settings.QUERY_EXPANSION_COUNT
    
# ? ==========================================================
def test_expand_query_exception_fallback():
    expander = QueryExpander()

    expander.chain = Mock()
    expander.chain.invoke.side_effect = Exception("LLM error")

    query = "cardiac arrest"
    results = expander.expand_query(query)

    assert results == [query]
    
    
# ? ==========================================================
from unittest.mock import patch
from app.services.query_expansion import expand_clinical_query


@patch("app.services.query_expansion.query_expander")
def test_expand_clinical_query(mock_expander):
    mock_expander.expand_query.return_value = [
        "original",
        "variant1",
        "variant2"
    ]

    results = expand_clinical_query("original")

    assert results == ["original", "variant1", "variant2"]
    mock_expander.expand_query.assert_called_once_with("original")