import pytest
from unittest.mock import patch, MagicMock
from app.services.llm import create_llm

@patch("app.services.llm.ChatOllama")
@patch("app.services.llm.settings")
def test_create_llm_success(mock_settings, mock_ollama_class):
    mock_settings.OLLAMA_MODEL = "llama3.1"
    mock_settings.OLLAMA_BASE_URL = "http://test-ollama:11434"
    mock_settings.LLM_TEMPERATURE = 0.2
    mock_settings.LLM_NUM_PREDICT = 1024
    mock_settings.LLM_TOP_P = 0.9
    mock_settings.LLM_REPEAT_PENALTY = 1.1
    
    llm = create_llm()
    
    mock_ollama_class.assert_called_once_with(
        model="llama3.1",
        base_url="http://test-ollama:11434",
        temperature=0.2,
        num_predict=1024,
        top_p=0.9,
        repeat_penalty=1.1,
    )
    assert llm == mock_ollama_class.return_value

@patch("app.services.llm.ChatOllama")
@patch("app.services.llm.settings")
def test_create_llm_failure(mock_settings, mock_ollama_class):
    mock_settings.OLLAMA_MODEL = "llama3.1"
    mock_settings.OLLAMA_BASE_URL = "http://invalid:11434"
    
    mock_ollama_class.side_effect = Exception("Connection refused")
    
    with pytest.raises(Exception):
        create_llm()
