from unittest.mock import MagicMock, patch

import pytest
from textwrap import dedent
try:
    from langchain_core.documents import Document
except ImportError:
    from langchain.schema import Document
from app.services.chunking import build_breadcrumb, estimate_tokens, clean_text, is_likely_header, split_documents

# ?=================================================================
def test_estimate_tokens():
    text = "Hello world this is a test"
    assert estimate_tokens(text) == 6
    assert estimate_tokens("") == 0

# ?=================================================================
def test_clean_text():
    dirty = "hello\x00world\x1f"
    cleaned = clean_text(dirty)
    assert cleaned == "helloworld"

# ?=================================================================
# test_is_likely_header
def test_detect_main_header():
    is_hdr, level = is_likely_header("1 INTRODUCTION")
    assert is_hdr is True
    assert level == 1

# :::::::::::::::::::::::::::
def test_detect_title():
    is_hdr, level = is_likely_header("1.1 Overview")
    assert is_hdr is True
    assert level == 2

# :::::::::::::::::::::::::::
def test_detect_subtitle():
    is_hdr, level = is_likely_header("A. Details")
    assert is_hdr is True
    assert level == 3

# :::::::::::::::::::::::::::
def test_not_header():
    is_hdr, level = is_likely_header("This is a normal sentence.")
    assert is_hdr is False



# ?=================================================================
def test_build_breadcrumb():
    hierarchy = ["Chapter 1", "Section 1.1", "Topic"]
    breadcrumb = build_breadcrumb(hierarchy)
    assert breadcrumb == "docs > Chapter 1 > Section 1.1 > Topic"
    

# ?=================================================================
def test_split_documents_basic_section():
    docs = [
        Document(
            page_content="1 INTRODUCTION\nThis is the intro text.",
            metadata={"source": "file1.pdf", "page": 1}
        )
    ]
    
    chunks = split_documents(docs)
    
    assert len(chunks) == 1
    assert "INTRODUCTION" in chunks[0].metadata["hierarchy"]
    assert chunks[0].metadata["chunk_type"] == "section"
    
# ?=================================================================
def test_split_documents_multiple_sections():
    docs = [
        Document(
            page_content=(
                "1 INTRODUCTION\n"
                "Intro text\n"
                "1.1 Details\n"
                "More text"
            ),
            metadata={"source": "file1.pdf", "page": 1}
        )
    ]

    chunks = split_documents(docs)

    assert len(chunks) == 2
    assert "INTRODUCTION" in chunks[0].metadata["hierarchy"]
    assert "1.1 Details" in chunks[1].metadata["hierarchy"]
    
# ?=================================================================
@patch("app.services.chunking.RecursiveCharacterTextSplitter")
def test_large_section_is_split(mock_splitter_class):
    mock_splitter = MagicMock()
    mock_splitter.split_text.return_value = ["part1", "part2"]
    mock_splitter_class.return_value = mock_splitter

    long_text = "1 INTRODUCTION\n" + ("word " * 500)

    docs = [
        Document(
            page_content=long_text,
            metadata={"source": "file1.pdf", "page": 1}
        )
    ]

    chunks = split_documents(docs)

    assert len(chunks) == 2
    assert chunks[0].metadata["chunk_type"] == "sub_section"
    assert chunks[1].metadata["chunk_type"] == "sub_section"

# ?=================================================================
def test_split_documents_empty():
    chunks = split_documents([])
    assert chunks == []