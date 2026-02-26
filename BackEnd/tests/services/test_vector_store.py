from unittest.mock import Mock, patch, MagicMock
import pytest
from app.services.vector_store import (
    create_qdrant_collection,
    store_embeddings,
    get_vector_store,
)
from app.services.search import (
    search_semantic,
    search_keyword,
    search_hybrid
)
from app.core.config import settings
from qdrant_client.http import models

# ?============================================================
def test_create_qdrant_collection_exists(mock_qdrant_client, mock_vector_store_embeddings):
    client_instance = mock_qdrant_client.return_value
    mock_collection = Mock()
    mock_collection.name = settings.QDRANT_COLLECTION_NAME
    client_instance.get_collections.return_value.collections = [mock_collection]
    

    result = create_qdrant_collection()
    
    assert result is True
    client_instance.create_collection.assert_not_called()

# ?============================================================
def test_create_qdrant_collection_new(mock_qdrant_client, mock_vector_store_embeddings):
    client_instance = mock_qdrant_client.return_value
    client_instance.get_collections.return_value.collections = []
    
    # Execute
    result = create_qdrant_collection()
    
    assert result is True
    client_instance.create_collection.assert_called_once()
    mock_vector_store_embeddings.return_value.embed_query.assert_called_with("test")

# ?============================================================
def test_store_embeddings(mock_qdrant_client, mock_vector_store_embeddings, mock_langchain_qdrant):
    
    client_instance = mock_qdrant_client.return_value

    mock_collection = Mock()
    mock_collection.name = settings.QDRANT_COLLECTION_NAME
    client_instance.get_collections.return_value.collections = [mock_collection]
    
    chunks = [Mock(page_content="test", metadata={})]
    
    result = store_embeddings(chunks)
    
    assert result is True
    mock_langchain_qdrant.from_documents.assert_called_once()

# ?============================================================
def test_get_vector_store(mock_qdrant_client, mock_vector_store_embeddings, mock_langchain_qdrant):
    result = get_vector_store()
    
    mock_langchain_qdrant.assert_called_once()
    assert result == mock_langchain_qdrant.return_value
