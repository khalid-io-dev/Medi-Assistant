import re
from typing import List, Dict, Optional, Tuple
try:
    from langchain_core.documents import Document
except ImportError:
    from langchain.schema import Document
from app.utils.logger import logger
from app.core.config import settings
try:
    from langchain_text_splitters import RecursiveCharacterTextSplitter
except ImportError:
    from langchain.text_splitter import RecursiveCharacterTextSplitter

# ---------------------------------------------------------------------------
# Utilitaires de détection et nettoyage
# ---------------------------------------------------------------------------

def estimate_tokens(text: str) -> int:
    """Estimation simple du nombre de tokens par le nombre de mots."""
    return int(len(text.split()))

def clean_text(text: str) -> str:
    """Nettoie le texte en supprimant les caractères de contrôle."""
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]', '', text)
    return text.strip()

def is_likely_header(line: str) -> Tuple[bool, int]:
    """
    Heuristique pour détecter un titre/en-tête dans le texte extrait d'un PDF.
    Retourne (is_header, level).
    Levels: 1 (Chapter/Main Section), 2 (Title), 3 (Sub-title)
    """
    line = line.strip()
    if not line or len(line) > 100:
        return False, 0

    # 1. Chapitres / Sections majeures 
    if line.isupper() and (re.match(r'^\d+[\.\s]', line) or len(line) < 50):
        return True, 1
    
    # 2. Titres numérotés 
    if re.match(r'^\d+\.\d+\s+', line):
        return True, 2
    
    # 3. Sous-titres 
    if re.match(r'^[A-Z]\.\s+', line):
        return True, 3

    return False, 0

def build_breadcrumb(hierarchy: List[str]) -> str:
    """Produit un fil d'Ariane : 'docs > chapter > section > ...'."""
    parts = ["docs"] + [h for h in hierarchy if h]
    return " > ".join(parts)

# ---------------------------------------------------------------------------
# Logique de chunking par section
# ---------------------------------------------------------------------------

def split_documents(documents: List[Document]) -> List[Document]:
    """
    Découpe les documents en sections basées sur les en-têtes détectés.
    Chaque section devient un chunk avec une métadonnée hiérarchique.
    """
    if not documents:
        logger.warning("🟡🟡 No documents provided for chunking.🟡")
        return []

    logger.info(f"☑️☑️ Chunking {len(documents)} pages by sections...☑️")
    all_chunks: List[Document] = []
    
    hierarchy = ["", "", ""]
    current_source = None
    chunk_index = 0
    
    current_section_content = []
    current_section_metadata = {}

    def flush_section():
        nonlocal chunk_index
        if not current_section_content:
            return
        
        content = "\n".join(current_section_content).strip()
        if content:
            hierarchy_str = build_breadcrumb(hierarchy)
            
            max_chars = settings.DEFAULT_CHUNK_SIZE * 4
            
            if len(content) > max_chars:
                logger.info(f"⚠️ Large section detected ({len(content)} chars), splitting further...")
                splitter = RecursiveCharacterTextSplitter(
                    chunk_size=max_chars,
                    chunk_overlap=settings.DEFAULT_CHUNK_OVERLAP,
                )
                texts = splitter.split_text(content)
                for i, text in enumerate(texts):
                    meta = current_section_metadata.copy()
                    meta["hierarchy"] = hierarchy_str
                    meta["breadcrumb"] = hierarchy_str
                    meta["chunk_index"] = chunk_index
                    meta["sub_chunk_index"] = i
                    meta["token_count"] = estimate_tokens(text)
                    meta["chunk_type"] = "sub_section"
                    
                    logger.debug(f"☑️ Created sub-chunk: {chunk_index}.{i} | Size: {len(text)} chars | Tokens: {meta['token_count']}")
                    all_chunks.append(Document(page_content=text, metadata=meta))
                    chunk_index += 1
            else:
                meta = current_section_metadata.copy()
                meta["hierarchy"] = hierarchy_str
                meta["breadcrumb"] = hierarchy_str
                meta["chunk_index"] = chunk_index
                meta["token_count"] = estimate_tokens(content)
                meta["chunk_type"] = "section"
                
                logger.debug(f"☑️ Created chunk: {chunk_index} | Size: {len(content)} chars | Tokens: {meta['token_count']}")
                all_chunks.append(Document(page_content=content, metadata=meta))
                chunk_index += 1
        
        current_section_content.clear()

    try:
        for doc in documents:
            source = doc.metadata.get("source", "unknown")
            if source != current_source:
                flush_section()
                current_source = source
                chunk_index = 0
                hierarchy = ["", "", ""]

            lines = doc.page_content.split('\n')
            for line in lines:
                is_hdr, level = is_likely_header(line)
                
                if is_hdr:
                    flush_section()
                    
                    title = line.strip()
                    if level == 1:
                        hierarchy = [title, "", ""]
                    elif level == 2:
                        hierarchy[1] = title
                        hierarchy[2] = ""
                    elif level == 3:
                        hierarchy[2] = title
                    
                    current_section_metadata = {
                        "source": source,
                        "page": doc.metadata.get("page", 0)
                    }
                
                if not current_section_metadata:
                    current_section_metadata = {
                        "source": source,
                        "page": doc.metadata.get("page", 0)
                    }
                
                current_section_content.append(line)

        flush_section()

        logger.info(f"☑️☑️ Chunking completed: {len(all_chunks)} sections created.☑️")
        if all_chunks:
            example = all_chunks[min(5, len(all_chunks)-1)]
            logger.info(f"☑️☑️ Example chunk – Metadata: {example.metadata}☑️")
            logger.info(f"☑️☑️ Example chunk – Content: {example.page_content[:150]}...☑️")

        return all_chunks

    except Exception as e:
        logger.exception("❌❌ Error during section-based chunking❌")
        raise RuntimeError("Chunking failed") from e