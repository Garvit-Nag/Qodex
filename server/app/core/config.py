import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./test.db")
    
    # Security
    secret_key: str = os.getenv("SECRET_KEY", "production-secret-key-change-me")
    nextjs_secret: str = os.getenv("NEXTJS_SECRET", "qodex-production-secret-2025")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # API Keys
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    
    # App
    environment: str = os.getenv("ENVIRONMENT", "production")
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    class Config:
        env_file = ".env"

settings = Settings()