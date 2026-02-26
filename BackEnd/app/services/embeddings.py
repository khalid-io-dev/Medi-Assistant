from functools import lru_cache
from langchain_community.embeddings import OllamaEmbeddings
from app.core.config import settings
from app.utils.logger import logger

@lru_cache()
def get_embedding_function(model_name: str = "nomic-embed-text") :
    logger.info(f"☑️☑️ Loading enbedding model : {model_name} via Ollama☑️")
    
    try:
        embeddings_model = OllamaEmbeddings(
            model=settings.EMBEDDING_MODEL_NAME,#model_name,
            base_url=settings.OLLAMA_BASE_URL
        )
        
        logger.info(f"☑️☑️ Embedding model loaded successfully.☑️")
        return embeddings_model
    except Exception as e:
        logger.exception(f"⛔⛔ Failed to load embedding model : {e}⛔")
        raise e