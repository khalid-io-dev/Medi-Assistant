from fastapi import APIRouter
from app.services.chunking import split_documents
from app.services.pdf_loader import load_pdf
from app.services.llm import create_llm
from app.services.embeddings import get_embedding_function
from app.services.vector_store import create_qdrant_collection
from app.services.vector_store import store_embeddings
from app.services.search import search_hybrid
from app.services.query_expansion import expand_clinical_query
from app.core.config import settings
from app.utils.logger import logger
from app.services.rag_pipeline import initialize_rag_system

router = APIRouter(tags=["Documents"])

# !::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
@router.get("/load-pdf")
async def get_documents(limit: int = 10):
    try:
        documents = load_pdf()
        
        limited_docs = documents[:limit]
        
        return {
            "status": "success",
            "total_count": len(documents),
            "returned_count": len(limited_docs),
            "documents": [
                {
                    "content": doc.page_content,
                    "metadata": doc.metadata
                } for doc in limited_docs
            ]
        }
    except Exception as e:
        return {"status": "error", "message": str(e)} 

# !::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
@router.get("/chunks")
async def get_chunks():
    try:
        documents = load_pdf()
        chunks = split_documents(documents=documents)
        
        return {
            "status": "success",
            "count": len(chunks),
            "chunks": [
                {
                    "content": chunk.page_content,
                    "metadata": chunk.metadata
                } for chunk in chunks
            ]
        }
    except Exception as e:
        return {"status": "error", "message": str(e)} 

# !::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
@router.get("/embedding-model-load")
async def get_embedding_endpoint():
    try:
        model = get_embedding_function()
        
        return {
            "status": "success",
            "model_name": settings.EMBEDDING_MODEL_NAME,
            "model": model,
        }
    except Exception as e:
        return {"status": "error", "message": str(e)} 

# !::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
@router.get("/embedding-vectore-store-collection")
async def get_vector_store_endpoint():
    try:
        collection = create_qdrant_collection()
        
        return {
            "status": "success",
            "collection_init": collection,
            "collection_name": settings.QDRANT_COLLECTION_NAME,
        }
    except Exception as e:
        return {"status": "error", "message": str(e)} 


# !::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
@router.get("/store-embedding")
async def store_embeddings_endpoint():
    try:
        collection = create_qdrant_collection()
        
        documents = load_pdf()
        chunks = split_documents(documents=documents)
        
        return_verification = store_embeddings(chunks=chunks)
        
        return {
            "status": "success",
            "store": return_verification,
            # "nbrs_vectore_stored": len_storing,
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
    
# !::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
@router.get("/search")
async def search_endpoint(query: str = "bonjour, comment ça va ?"):
    try:
        collection = create_qdrant_collection()
        
        documents = load_pdf()
        chunks = split_documents(documents=documents)
        
        return_verification = store_embeddings(chunks=chunks)
        
        resultats = search_hybrid(query, top_k=settings.SEARCH_TOP_K, alpha=settings.SEARCH_ALPHA)
        
        return {
            "status": "success",
            "return_verification": return_verification,
            "results": resultats,
            "length_results": len(resultats),
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
    
    
# !::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
@router.get("/queries")
async def get_expanded_queries(query: str = "c'est quoi le Douleur abdominal ?"):
    """
    Expand a clinical query into multiple variations using vLLM.
    """
    try:
        expanded_list = expand_clinical_query(query)
        
        return {
            "status": "success",
            "data": {
                "original_query": query,
                "variations": expanded_list[1:] if len(expanded_list) > 1 else [],
                "all_queries": expanded_list,
                "count": len(expanded_list)
            },
            "meta": {
                "model": settings.OLLAMA_MODEL,
                "engine": "Ollama"
            }
        }
    except Exception as e:
        logger.error(f"Error in /queries endpoint: {str(e)}")
        return {"status": "error", "message": str(e)} 
    
    
# !::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
@router.get("/llm-model")
async def get_llm_model():
    try:
        model = create_llm()
        
        return {
            "status": "success",
            "model_type": str(type(model)),
            "model_name": settings.OLLAMA_MODEL,
            "base_url": settings.OLLAMA_BASE_URL
        }
    except Exception as e:
        return {"status": "error", "message": str(e)} 
        
    
# !::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
@router.get("/retriever")
async def get_retriever():
    try:
        model = initialize_rag_system(force_recreate_db=True)
        
        return {
            "status": "success",
            "message": "RAG system initialized successfully",
            "chain_type": str(type(model))
        }
    except Exception as e:
        return {"status": "error", "message": str(e)} 
    
    
# !::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
