from pydantic_settings import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # App
    app_name: str = "CodeQuery API"
    debug: bool = os.getenv("DEBUG", "False").lower() == "true"
    environment: str = os.getenv("ENVIRONMENT", "development")
    
    # Security
    secret_key: str = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production-123456789")
    algorithm: str = os.getenv("ALGORITHM", "HS256")
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # Database
    database_url: str = os.getenv("DATABASE_URL", "postgresql://codequery_user:codequery_pass@localhost:5432/codequery_dev")
    
    # Redis
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # Google AI (We'll get this key together later)
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    
    # CORS
    allowed_origins: list[str] = [
        "http://localhost:3000",  # Next.js dev server
        "http://127.0.0.1:3000",
    ]
    
    class Config:
        env_file = ".env"

settings = Settings()
