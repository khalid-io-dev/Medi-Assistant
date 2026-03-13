import pytest
from unittest.mock import patch, MagicMock
from app.services.rag_pipeline import initialize_rag_system, create_rag_chain, invoke_rag_with_tracing

@patch("app.services.rag_pipeline.load_pdf")
@patch("app.services.rag_pipeline.split_documents")
@patch("app.services.rag_pipeline.store_embeddings")
@patch("app.services.rag_pipeline.create_retriever")
@patch("app.services.rag_pipeline.create_llm")
def test_initialize_rag_system_force_recreate(
    mock_create_llm, 
    mock_create_retriever, 
    mock_store_embeddings, 
    mock_split_documents, 
    mock_load_pdf
):
    mock_load_pdf.return_value = ["doc1"]
    mock_split_documents.return_value = ["chunk1"]
    mock_retriever = MagicMock()
    mock_create_retriever.return_value = mock_retriever
    mock_llm = MagicMock()
    mock_create_llm.return_value = mock_llm
    
    chain = initialize_rag_system(force_recreate_db=True)
    
    mock_load_pdf.assert_called_once()
    mock_split_documents.assert_called_once()
    mock_store_embeddings.assert_called_once()
    mock_create_retriever.assert_called_once()
    mock_create_llm.assert_called_once()
    assert chain is not None

@patch("app.services.rag_pipeline.load_pdf")
@patch("app.services.rag_pipeline.split_documents")
@patch("app.services.rag_pipeline.store_embeddings")
@patch("app.services.rag_pipeline.create_retriever")
@patch("app.services.rag_pipeline.create_llm")
def test_initialize_rag_system_no_recreate(
    mock_create_llm, 
    mock_create_retriever, 
    mock_store_embeddings, 
    mock_split_documents, 
    mock_load_pdf
):
    mock_retriever = MagicMock()
    mock_create_retriever.return_value = mock_retriever
    mock_llm = MagicMock()
    mock_create_llm.return_value = mock_llm
    
    chain = initialize_rag_system(force_recreate_db=False)
    
    mock_load_pdf.assert_not_called()
    mock_split_documents.assert_not_called()
    mock_store_embeddings.assert_not_called()
    mock_create_retriever.assert_called_once()
    assert chain is not None

@patch("app.services.rag_pipeline.tracer")
def test_invoke_rag_with_tracing_success(mock_tracer):
    # Setup mock chain
    mock_chain = MagicMock()
    mock_chain.invoke.return_value = {"answer": "test answer", "context": []}
    
    # Setup mock span
    mock_span = MagicMock()
    mock_tracer.start_as_current_span.return_value.__enter__.return_value = mock_span
    
    result = invoke_rag_with_tracing(mock_chain, "test question")
    
    assert result is not None
    mock_span.set_attribute.assert_any_call("question", "test question")
    mock_span.set_attribute.assert_any_call("success", True)

@patch("app.services.rag_pipeline.tracer")
def test_invoke_rag_with_tracing_error(mock_tracer):
    # Setup mock chain to raise exception
    mock_chain = MagicMock()
    mock_chain.invoke.side_effect = Exception("Test error")
    
    # Setup mock span
    mock_span = MagicMock()
    mock_tracer.start_as_current_span.return_value.__enter__.return_value = mock_span
    
    with pytest.raises(Exception):
        invoke_rag_with_tracing(mock_chain, "test question")
    
    mock_span.set_attribute.assert_any_call("question", "test question")
    mock_span.set_attribute.assert_any_call("success", False)
