from langchain_ollama import ChatOllama
from app.core.config import settings
from app.utils.logger import logger


def create_llm() -> ChatOllama :
    logger.info(f"☑️☑️ Connectiong to Ollama LLM ({settings.OLLAMA_MODEL}) at {settings.OLLAMA_BASE_URL} ...☑️")
    
    
    
    try: 
        llm = ChatOllama(
            model = settings.OLLAMA_MODEL,
            base_url = settings.OLLAMA_BASE_URL, 
            temperature = settings.LLM_TEMPERATURE, 
            num_predict = settings.LLM_NUM_PREDICT,
            top_p = settings.LLM_TOP_P,
            repeat_penalty = settings.LLM_REPEAT_PENALTY,
        )
        
        logger.info(f"☑️☑️ Ollama LLM connected successfully.☑️")
        return llm
    except Exception as e:
        logger.error(f"⛔⛔ Failed to connect to Ollama LLM: {e}⛔")
        raise
    
    