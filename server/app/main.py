from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import repositories, chat
from app.core.database import engine, Base
from datetime import datetime
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="QODEX API",
    description="AI-powered code repository chat system",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://qodex.vercel.app",              # Your frontend domain
        "https://qodex-frontend.vercel.app",     # Alternative frontend domain
        "http://localhost:3000",                 # Local development
        "http://127.0.0.1:3000",                # Local development
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Create tables on startup
@app.on_event("startup")
async def startup_event():
    """Create database tables on startup"""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("🗄️ Database tables created successfully")
    except Exception as e:
        logger.error(f"❌ Error creating database tables: {e}")

# Health check endpoint
@app.get("/health")
@app.head("/health")
async def health_check():
    """Health check endpoint for monitoring services (GET and HEAD)"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "QODEX API",
        "version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "production"),
        "message": "QODEX is running smoothly! 🚀"
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to QODEX API! 🚀",
        "description": "AI-powered code repository chat system",
        "docs": "/docs",
        "health": "/health",
        "status": "running",
        "version": "1.0.0"
    }

# Include routers
app.include_router(repositories.router, prefix="/api/v1/repositories", tags=["repositories"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])