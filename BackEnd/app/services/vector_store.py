from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams
from qdrant_client.http import models
from app.services.embeddings import get_embedding_function
from app.core.config import settings
from app.utils.logger import logger
from typing import List, Optional, Dict, Tuple
import uuid

try:
    from langchain_core.documents import Document
except ImportError:
    try:
        from langchain.schema import Document
    except ImportError:
        from langchain.docstore.document import Document
        
# !::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
def create_qdrant_collection():
    
    client = QdrantClient(url=settings.QDRANT_URL)
    
    collections = client.get_collections()
    
    if settings.QDRANT_COLLECTION_NAME in [c.name for c in collections.collections]:
        logger.info(f"☑️☑️ Collection {settings.QDRANT_COLLECTION_NAME} already existe.☑️")   
        return True
    
    embeddings = get_embedding_function()
    test_embedding = embeddings.embed_query("test")
    
    client.create_collection(
        collection_name=settings.QDRANT_COLLECTION_NAME,
        vectors_config=VectorParams(
            size=len(test_embedding),
            distance=Distance.COSINE
        )
    )
    
    logger.info(f"☑️☑️ Collection {settings.QDRANT_COLLECTION_NAME} created.☑️")
    return True

# !::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
def store_embeddings(chunks: List[Document]):
    
    try:
        create_qdrant_collection()
        
        embeddings_model = get_embedding_function()
        
        QdrantVectorStore.from_documents(
            documents=chunks,
            embedding=embeddings_model,
            url=settings.QDRANT_URL,
            collection_name=settings.QDRANT_COLLECTION_NAME,
            force_recreate=True,
        )
        
        logger.info(f"☑️☑️ {len(chunks)} documents stockés.☑️")
        return True
        
    except Exception as e:
        logger.error(f"⛔⛔ Erreur stockage: {e}⛔")
        raise
    
# !::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
def get_vector_store():
    embedding_model = get_embedding_function()
    
    return QdrantVectorStore(
        client=QdrantClient(url=settings.QDRANT_URL),
        collection_name=settings.QDRANT_COLLECTION_NAME,
        embedding=embedding_model,
    )
    
    