import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database
    database_url: str = os.getenv("DATABASE_URL")  # ✅ No fallback for production
    
    # Security - NO HARDCODED SECRETS!
    secret_key: str = os.getenv("SECRET_KEY")  # ✅ Must come from environment
    nextjs_secret: str = os.getenv("NEXTJS_SECRET")  # ✅ Must come from environment
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # API Keys - NO HARDCODED KEYS!
    gemini_api_key: str = os.getenv("GEMINI_API_KEY")  # ✅ Must come from environment
    pinecone_api_key: str = os.getenv("PINECONE_API_KEY")  # ✅ Must come from environment
    
    # Pinecone Configuration
    pinecone_index_name: str = os.getenv("PINECONE_INDEX_NAME", "qodex")  # Only this has safe fallback
    pinecone_environment: str = os.getenv("PINECONE_ENVIRONMENT", "gcp-starter")
    
    # App
    environment: str = os.getenv("ENVIRONMENT", "production")
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    class Config:
        env_file = ".env"

settings = Settings()