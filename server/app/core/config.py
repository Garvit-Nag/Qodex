# app/core/config.py
from pydantic_settings import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # App
    app_name: str = "QODEX API"
    debug: bool = os.getenv("DEBUG", "False").lower() == "true"
    environment: str = os.getenv("ENVIRONMENT", "development")
    
    # Security - NEW: NextJS Secret for route protection
    nextjs_secret: str = os.getenv("NEXTJS_SECRET", "qodex-nextjs-secret-2025-change-in-production")
    secret_key: str = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production-123456789")
    algorithm: str = os.getenv("ALGORITHM", "HS256")
    
    # Database
    database_url: str = os.getenv("DATABASE_URL", "postgresql://codequery_user:codequery_pass@localhost:5432/codequery_dev")
    
    # Google AI
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    
    # CORS
    allowed_origins: list[str] = [
        "http://localhost:3000",  # Next.js dev server
        "http://127.0.0.1:3000",
        "http://localhost:8000",  # FastAPI docs
    ]
    
    class Config:
        env_file = ".env"
        extra = "ignore"  # This fixes the validation error!

settings = Settings()