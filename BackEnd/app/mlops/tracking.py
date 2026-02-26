from typing import Optional, Tuple, Dict, Any
import mlflow
from app.mlops.mlflow_logger import MLflowLogger
from app.core.config import settings

# !::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
def create_query_run(run_name_prefix: str = "query") -> Tuple[MLflowLogger, mlflow.ActiveRun]:
    logger_istance = MLflowLogger(experiment_name="CliniQ_Experiment")
    
    run = logger_istance.start_run(run_name=run_name_prefix)
    
    rag_config = {
        # Global
        "project" : settings.PROJECT_NAME,
        "environement": settings.ENVIRONMENT,
        
        # Qdrant
        "Qdrant_collection": settings.QDRANT_COLLECTION_NAME,
        
        # Embedding
        "Embedding_model_name": settings.EMBEDDING_MODEL_NAME,
        "Embedding_demension": settings.EMBEDDING_DIMENSION,
        
        # Search
        "Search_Top_k": settings.SEARCH_TOP_K,
        "Search_alpha": settings.SEARCH_ALPHA,
        
        # Ollama
        "Ollama_base_rul": settings.OLLAMA_BASE_URL,
        "Ollama_model": settings.OLLAMA_MODEL,
        
        # LLM
        "LLM_Num_predict": settings.LLM_NUM_PREDICT,
        "LLM_repeat_penalty": settings.LLM_REPEAT_PENALTY,
        "LLM_Temperature": settings.LLM_TEMPERATURE,
        "LLM_Top_p": settings.LLM_TOP_P,
        
        # Query expansion 
        "Query_expansion_count": settings.QUERY_EXPANSION_COUNT,
        
        # Retrieval
        "Retrieval_reranking": settings.RETRIEVAL_RERANKING,
        "Retrieval_Top_K": settings.RETRIEVAL_TOP_K,
        "Retrieval_alpha": settings.RETRIEVAL_ALPHA,
        
        # Chunking
        "Chunking_chunk_size": settings.DEFAULT_CHUNK_SIZE,
        "Chunking_chunk_overlap": settings.DEFAULT_CHUNK_OVERLAP,
    }
    
    logger_istance.log_rag_config(rag_config)
    
    return logger_istance, run