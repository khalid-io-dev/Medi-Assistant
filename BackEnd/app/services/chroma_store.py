from langchain_chroma import Chroma
from langchain_ollama import OllamaEmbeddings
from app.core.config import settings
from app.utils.logger import logger
from typing import List, Optional
import os

try:
    from langchain_core.documents import Document
except ImportError:
    from langchain.schema import Document

# !::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
def get_chroma_embedding_function():
    """
    Get the embedding function for ChromaDB.
    Uses Ollama embeddings with the configured model.
    """
    return OllamaEmbeddings(
        model=settings.EMBEDDING_MODEL_NAME,
        base_url=settings.NGROK_OLLAMA_URL if settings.NGROK_OLLAMA_URL else settings.OLLAMA_BASE_URL
    )

# !::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
def create_chroma_collection():
    """
    Create ChromaDB collection if it doesn't exist.
    The data is persisted to the CHROMA_DB_PATH directory.
    """
    embeddings = get_chroma_embedding_function()
    
    # Ensure the directory exists
    os.makedirs(settings.CHROMA_DB_PATH, exist_ok=True)
    
    chroma = Chroma(
        collection_name=settings.CHROMA_COLLECTION_NAME,
        embedding_function=embeddings,
        persist_directory=settings.CHROMA_DB_PATH
    )
    
    logger.info(f"☑️☑️ ChromaDB collection '{settings.CHROMA_COLLECTION_NAME}' initialized at {settings.CHROMA_DB_PATH} ☑️")
    return chroma

# !::::::::::::::::::.py
def store_embeddings_in_chroma(chunks: List[Document]):
    """
    Store document chunks in ChromaDB.
    """
    try:
        # Create or get existing collection
        chroma = create_chroma_collection()
        
        # Clear existing documents if needed
        chroma.delete_collection()
        chroma = create_chroma_collection()
        
        # Add documents
        chroma.add_documents(documents=chunks)
        
        logger.info(f"☑️☑️ {len(chunks)} documents stored in ChromaDB.☑️")
        return True
        
    except Exception as e:
        logger.error(f"⛔⛔ Error storing embeddings in ChromaDB: {e}⛔")
        raise

# !:::::::::::::::::::.py
def get_chroma_vector_store():
    """
    Get the ChromaDB vector store for retrieval.
    """
    embeddings = get_chroma_embedding_function()
    
    return Chroma(
        collection_name=settings.CHROMA_COLLECTION_NAME,
        embedding_function=embeddings,
        persist_directory=settings.CHROMA_DB_PATH
    )

# !:::::::::::::::::::.py
def search_documents_in_chroma(query: str, k: int = 10):
    """
    Search for similar documents in ChromaDB.
    """
    try:
        vector_store = get_chroma_vector_store()
        results = vector_store.similarity_search(query, k=k)
        return results
    except Exception as e:
        logger.error(f"⛔⛔ Error searching documents in ChromaDB: {e}⛔")
        raise
