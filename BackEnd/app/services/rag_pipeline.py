from langchain_core.runnables import RunnablePassthrough, RunnableParallel
from langchain_core.output_parsers import StrOutputParser
from app.services.prompt import get_prompt
from app.services.llm import create_llm
from app.services.vector_store import store_embeddings
from app.services.chunking import split_documents
from app.services.pdf_loader import load_pdf
from app.services.utils import format_docs
from app.utils.logger import logger
from app.services.retriever import create_retriever
from app.core.config import settings
from app.telemetry import tracer
import time


# !::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
def create_rag_chain(retriever, llm):
    prompt = get_prompt()
    
    
    rag_chain_from_docs = (
        RunnablePassthrough.assign(context=(lambda x: format_docs(x["context"])))
        | prompt
        | llm
        | StrOutputParser()
    )
    
    rag_chain_with_source = RunnableParallel(
        {
            "context": retriever,
            "question": RunnablePassthrough()
        }
    ).assign(answer=rag_chain_from_docs)
    
    return rag_chain_with_source

# !::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
def initialize_rag_system(force_recreate_db=False, retriever_top_k: int = settings.RETRIEVAL_TOP_K, retriever_alpha: float = settings.RETRIEVAL_ALPHA):
    
    logger.info(f"☑️☑️ Initialise le système RAG. ☑️")
    
    if force_recreate_db:
        
        logger.info("☑️☑️ Loading documents... ☑️")
        documents = load_pdf()
        print(f"🚩==========> nb_documents_loaded : ", len(documents))
        
        logger.info(f"☑️☑️ Splitting {len(documents)} documents... ☑️")
        chunks = split_documents(documents)
        print(f"🚩==========> nb_chunks_created : ", len(chunks))
        
        logger.info("☑️☑️ Storing embeddings in Qdrant... ☑️")
        store_embeddings(chunks)
        
        
    else:
        logger.info(f"☑️☑️ Skipping document loading (force_recreate_db=False). Assuming VectorDB is populated. ☑️")
        
    logger.info(f"☑️☑️ Creating HybridRetriever with top_k={retriever_top_k}, alpha={retriever_alpha} ☑️")
    retriever = create_retriever(top_k=retriever_top_k, alpha=retriever_alpha)
    
    llm = create_llm()
    
    rag_chain = create_rag_chain(retriever=retriever, llm=llm)
    
    return rag_chain

# !::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
def invoke_rag_with_tracing(rag_chain, question: str):
    """
    Invoke RAG chain with OpenTelemetry tracing for latency tracking and error capture.
    
    Args:
        rag_chain: The RAG chain to invoke
        question: The question to ask
        
    Returns:
        The response from the RAG chain
    """
    with tracer.start_as_current_span("rag_pipeline_invocation") as span:
        span.set_attribute("question", question)
        
        start_time = time.time()
        
        try:
            response = rag_chain.invoke(question)
            
            latency = time.time() - start_time
            span.set_attribute("latency_seconds", latency)
            span.set_attribute("success", True)
            
            logger.info(f"RAG latency: {latency:.4f} seconds")
            
            return response
            
        except Exception as e:
            latency = time.time() - start_time
            span.set_attribute("latency_seconds", latency)
            span.set_attribute("success", False)
            span.set_attribute("error", str(e))
            
            logger.error(f"RAG error: {e}")
            raise