import pytest
from unittest.mock import patch, MagicMock
from app.services.chat import ask_question, get_qa_chain

@patch("app.services.chat.initialize_rag_system")
@pytest.mark.asyncio
async def test_ask_question_first_call(mock_init):
    mock_chain = MagicMock()
    mock_init.return_value = mock_chain
    
    doc = MagicMock()
    doc.metadata = {"source": "doc1.pdf"}
    
    mock_chain.invoke.return_value = {
        "answer": "Test answer",
        "context": [doc]
    }
    
    import app.services.chat
    app.services.chat._qa_chain = None
    
    result = await ask_question("Hello")
    
    mock_init.assert_called_once()
    mock_chain.invoke.assert_called_once_with("Hello")
    assert result["answer"] == "Test answer"
    assert result["sources"] == ["doc1.pdf"]

@patch("app.services.chat.initialize_rag_system")
@pytest.mark.asyncio
async def test_ask_question_error(mock_init):
    mock_chain = MagicMock()
    mock_init.return_value = mock_chain
    mock_chain.invoke.side_effect = Exception("RAG Error")
    
    import app.services.chat
    app.services.chat._qa_chain = None
    
    result = await ask_question("Hello")
    
    assert "Une erreur est survenue" in result["answer"]
    assert result["sources"] == []
