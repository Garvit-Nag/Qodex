import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = os.getenv("DATABASE_URL") 
    
    secret_key: str = os.getenv("SECRET_KEY") 
    nextjs_secret: str = os.getenv("NEXTJS_SECRET") 
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # API Keys - NO HARDCODED KEYS!
    gemini_api_key: str = os.getenv("GEMINI_API_KEY")  
    pinecone_api_key: str = os.getenv("PINECONE_API_KEY")  
    
    # Pinecone Configuration
    pinecone_index_name: str = os.getenv("PINECONE_INDEX_NAME", "qodex")  
    pinecone_environment: str = os.getenv("PINECONE_ENVIRONMENT", "gcp-starter")
    
    # App
    environment: str = os.getenv("ENVIRONMENT", "production")
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    class Config:
        env_file = ".env"

settings = Settings()