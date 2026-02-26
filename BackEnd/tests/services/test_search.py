

# ?============================================================
from unittest.mock import Mock, patch
from app.services.search import search_semantic
from langchain_core.documents import Document


@patch("app.services.search.get_vector_store")
def test_search_semantic(mock_get_vector_store):
    
    mock_store = Mock()
    mock_get_vector_store.return_value = mock_store

    mock_doc = Document(page_content="result", metadata={})
    mock_store.similarity_search_with_score.return_value = [(mock_doc, 0.9)]

    results = search_semantic("query", top_k=5)

    assert len(results) == 1
    assert results[0][0].page_content == "result"

    mock_store.similarity_search_with_score.assert_called_with(
        query="query",
        k=5,
        filter=None
    )
# ?============================================================
from unittest.mock import Mock, patch
from app.services.search import search_keyword


@patch("app.services.search.QdrantClient")
def test_search_keyword(mock_qdrant):

    client_instance = mock_qdrant.return_value

    mock_point = Mock()
    mock_point.payload = {
        "content": "this is a test keyword example",
        "metadata": {"source": "file.pdf"}
    }

    client_instance.scroll.return_value = ([mock_point], None)

    results = search_keyword("test keyword", top_k=5)

    assert len(results) == 1
    assert results[0][0].page_content == "this is a test keyword example"
    assert results[0][1] > 0

    client_instance.scroll.assert_called_once()

# ?============================================================
from unittest.mock import Mock, patch
from app.services.search import search_hybrid
from langchain_core.documents import Document


@patch("app.services.search.search_semantic")
@patch("app.services.search.search_keyword")
@patch("app.services.search.SEARCH_REQUEST_TOTAL")
def test_search_hybrid(
    mock_search_request_total,
    mock_search_keyword,
    mock_search_semantic
):

    mock_search_request_total.inc = Mock()

    # Mock semantic result
    doc_sem = Document(page_content="semantic_doc", metadata={"_id": "1"})
    mock_search_semantic.return_value = [(doc_sem, 0.8)]

    # Mock keyword result
    doc_key = Document(page_content="keyword_doc", metadata={"_id": "2"})
    mock_search_keyword.return_value = [(doc_key, 0.6)]

    results = search_hybrid("test query", top_k=2, alpha=0.5)

    assert len(results) == 2

    contents = [doc.page_content for doc in results]

    assert "semantic_doc" in contents
    assert "keyword_doc" in contents