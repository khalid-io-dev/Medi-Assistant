import time
from app.core.config import settings
from app.services.embeddings import get_embedding_function
from app.utils.logger import logger
from typing import List, Optional, Dict, Tuple
from qdrant_client import QdrantClient
from app.services.vector_store import get_vector_store
try:
    from langchain_core.documents import Document
except ImportError:
    try:
        from langchain.schema import Document
    except ImportError:
        from langchain.docstore.document import Document

from app.services.query_expansion import expand_clinical_query
import uuid
from app.utils.metrics import (
    SEARCH_DURATION,
    SEARCH_DOCS_FINAL,
    SEARCH_DOCS_KEYWORD,
    KEYWORD_DURATION,
    SEARCH_DOCS_SEMANTIC,
    SEMANTIC_DURATION,
    SEARCH_REQUEST_TOTAL, 
    RAG_HYBRID_SCORE, 
    RAG_RETRIEVAL_SIMILARITY,
    
)

        

# !::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
def search_semantic(query:str, top_k: int = settings.SEARCH_TOP_K, filters: Optional[Dict] = None) -> List[Tuple[Document, float]]:
    logger.info(f"☑️☑️ Recherche sémantique avec scores de similarité.☑️")
    
    vector_store = get_vector_store()
    
    results = vector_store.similarity_search_with_score(
        query=query,
        k=top_k,
        filter=filters
    )
    
    return results


# !::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
def search_keyword(query: str, top_k: int = settings.SEARCH_TOP_K) -> List[Document]:
    logger.info(f"☑️☑️ Recherche par mots-clés en utilisant le payload de Qdrant.☑️")
    client = QdrantClient(url=settings.QDRANT_URL)
    
    all_points = client.scroll(
        collection_name=settings.QDRANT_COLLECTION_NAME, 
        limit=1000,
        with_payload=True
    )[0]
    
    keywords = [word.lower() for word in query.split() if len(word) > 3]
    
    scored_result = []
    
    for point in all_points:
        content = point.payload.get('content', '').lower()
        metadata = point.payload.get('metadata', {})
        
        score = 0
        for keyword in keywords:
            if keyword in content:
                score += content.count(keyword)
                
        if score > 0:
            doc = Document(
                page_content = point.payload.get('content', ''),
                metadata = metadata
            )
            
            normalized_score = min(score / len(keywords), 1.0)
            scored_result.append((doc, normalized_score))
            
    scored_result.sort(key=lambda x: x[1], reverse=True)
    return scored_result[:top_k]


# !::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

def search_hybrid(query: str, top_k: int = settings.SEARCH_TOP_K, alpha: float = settings.SEARCH_ALPHA) -> List[Document]:
    
    start_total = time.time()
    SEARCH_REQUEST_TOTAL.inc()

    logger.info(f"☑️☑️ Hybrid search request: query='{query}', top_k={top_k}, alpha={alpha}☑️")
    
    queries_to_run = [query]
    if settings.QUERY_EXPANSION_ENABLED:
        queries_to_run = expand_clinical_query(query)

    all_merged_results = {}

    for current_query in queries_to_run:
        logger.info(f"🔎 Processing variation: {current_query}")
        
        # Semantic timing
        start_semantic = time.time()
        semantic_results = search_semantic(current_query, top_k=top_k)
        SEMANTIC_DURATION.observe(time.time() - start_semantic)
        SEARCH_DOCS_SEMANTIC.observe(len(semantic_results))
        
        # Keyword timing
        start_keyword = time.time()
        keywords_results = search_keyword(current_query, top_k=top_k)
        KEYWORD_DURATION.observe(time.time() - start_keyword)
        SEARCH_DOCS_KEYWORD.observe(len(keywords_results))
        
        # Merge semantic
        for doc, score in semantic_results:
            RAG_RETRIEVAL_SIMILARITY.observe(score)
            doc_id = doc.metadata.get('_id', str(uuid.uuid4()))
            if doc_id in all_merged_results:
                all_merged_results[doc_id]['score'] = max(all_merged_results[doc_id]['score'], score * alpha)
            else:
                all_merged_results[doc_id] = {
                    'doc': doc,
                    'score': score * alpha
                }
                
        # Merge keyword
        for doc, score in keywords_results:
            RAG_RETRIEVAL_SIMILARITY.observe(score)
            doc_id = doc.metadata.get('_id', str(uuid.uuid4()))
            keyword_score = score * (1 - alpha)
            if doc_id in all_merged_results:
                if 'has_keyword' not in all_merged_results[doc_id]:
                    all_merged_results[doc_id]['score'] += keyword_score
                    all_merged_results[doc_id]['has_keyword'] = True
            else:
                all_merged_results[doc_id] = {
                    'doc': doc,
                    'score': keyword_score,
                    'has_keyword': True
                }

    sorted_results = sorted(
        all_merged_results.values(),
        key=lambda x: x['score'],
        reverse=True
    )

    final_docs = [item['doc'] for item in sorted_results[:top_k]]
    for item in sorted_results[:top_k]:
        RAG_HYBRID_SCORE.observe(item["score"])


    # Final metrics
    SEARCH_DOCS_FINAL.observe(len(final_docs))
    SEARCH_DURATION.observe(time.time() - start_total)

    logger.info(f"===="*50)
    logger.info(f"😊😊🔎🔎 Hybrid search - final_docs count: {len(final_docs)}🔎🔎😊😊")
    logger.info(f"===="*50)

    return final_docs
