from pydantic import model_validator, Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # General
    PROJECT_NAME: str = Field(default="CliniQ API", validation_alias="PROJECT_NAME")
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "dev"
    
    # Evaluation Configuration
    EVALUATE_STATUS: bool = False
    
    # Security - ces champs sont requis
    SECRET_KEY: str = Field(...) 
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 11520
    
    # Database Configuration - requis
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "CliniQ_DB"
    DATABASE_URL: str | None = None
    
    # Qdrant Configuration
    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333
    QDRANT_API_KEY: str | None = None
    QDRANT_COLLECTION_NAME: str = "CliniQ_collection"
    QDRANT_URL: str | None = None 
    
    # Embedding Configuration
    EMBEDDING_MODEL_NAME: str = "bge-m3" # ou bien "all-minilm" ou "nomic-embed-text"
    EMBEDDING_DIMENSION: int = 1024 # 384 pour all-minilm, 768 pour nomic-embed-text
    
    # Search Configuration
    SEARCH_TOP_K: int = 10
    SEARCH_ALPHA: float = 0.7
    
    # Ollama Configuration
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.1"
    LLM_NUM_PREDICT: int = 1024
    LLM_REPEAT_PENALTY: float = 1.1
    LLM_TEMPERATURE: float = 0.2
    LLM_TOP_P: float = 0.9
    
    # Query Expansion Configuration
    QUERY_EXPANSION_ENABLED: bool = True
    QUERY_EXPANSION_COUNT: int = 3
    
    # Retrieval Configuration
    RETRIEVAL_RERANKING: bool = True
    RETRIEVAL_TOP_K: int = 10
    RETRIEVAL_ALPHA: float = 0.7
    
    
    # Chunking Configaration
    DEFAULT_CHUNK_SIZE: int = 400
    DEFAULT_CHUNK_OVERLAP: int = 80
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding='utf-8',
        case_sensitive=True,
        extra="ignore"
    )

    @model_validator(mode="after")
    def assemble_db_connection(self):
        """Construit DATABASE_URL si non fournie"""
        if not self.DATABASE_URL:
            self.DATABASE_URL = f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        return self
    
    @model_validator(mode="after")
    def assemble_qdrant_url(self):
        """Construit QDRANT_URL si non fournie"""
        if not self.QDRANT_URL:
            self.QDRANT_URL = f"http://{self.QDRANT_HOST}:{self.QDRANT_PORT}"
        return self
    
    
    
settings = Settings()