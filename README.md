# MediAssistant

## 📌 Description

MediAssistant is a clinical decision support assistant based on a **RAG (Retrieval-Augmented Generation)** architecture, enabling healthcare professionals to instantly access medical protocols and clinical documentation.

This repository contains the **complete backend**, including:

- Secure REST API with FastAPI
- Optimized RAG pipeline (LangChain)
- LLMOps tracking & evaluation with MLflow
- PostgreSQL database
- JWT authentication
- Prometheus & Grafana monitoring
- Automated CI/CD

The goal is to provide reliable, contextualized answers based solely on indexed medical documents.

---

# 🧠 RAG Architecture

## 1️⃣ Ingestion & Preprocessing
- Loading medical protocols (PDF)
- Intelligent chunking with overlap
- Adding metadata (section, page, source)

## 2️⃣ Embeddings & Vector Store
- Embedding generation (Hugging Face / LLM)
- Vector storage with Qdrant

## 3️⃣ Retrieval
- Similarity search (cosine)
- Query expansion
- Reranking

## 4️⃣ Generation
- Centralized prompt engineering
- Contextualized responses
- Hallucination reduction

---

# 🚀 Features

## 🌐 FastAPI API

Main endpoints:

- `/login`
- `/chat`
- `/history`
- `/health`

Validation: **Pydantic**  
ORM: **SQLAlchemy**  
Database: **PostgreSQL**

---

## 🔐 Security

- JWT authentication
- Password hashing
- Centralized exception management
- Configuration via `.env`

---

## 📊 LLMOps – MLflow & DeepEval

Automatic tracking:

- RAG parameters (chunking, k, similarity)
- LLM parameters (temperature, max_tokens, top_p)
- Responses & contexts
- RAG metrics:
  - Answer Relevance
  - Faithfulness
  - Precision@k
  - Recall@k

---

## 📈 Monitoring

### Prometheus
- Latency
- Number of requests
- Error rates
- RAG metrics
- CPU / RAM

### Grafana
- Real-time clinical dashboard
- Configurable alerts

---


## 🛠️ Technologies

* Python
* FastAPI
* LangChain
* PostgreSQL
* SQLAlchemy
* Qdrant
* MLflow
* DeepEval
* JWT
* Docker
* Prometheus
* Grafana
* Pytest


