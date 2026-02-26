import os
from langchain_community.document_loaders import PyPDFDirectoryLoader
from app.utils.logger import logger

DATA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../data"))

def load_pdf():
    logger.info(f"☑️☑️ Loading PDF documents from {DATA_PATH}...☑️")
    
    if not os.path.exists(DATA_PATH):
        logger.error(f"⛔⛔ Directory not found: {DATA_PATH}⛔")
        return []
    
    try:
        loader = PyPDFDirectoryLoader(DATA_PATH)
        documents = loader.load()
        logger.info(f"☑️☑️ Loaded {len(documents)} pages form PDFs.☑️")
        return documents
    except Exception as e:
        logger.error(f"⛔⛔ Failed to load PDFs: {e}⛔")
        return []