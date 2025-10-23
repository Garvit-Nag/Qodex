from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
from app.database import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CodeQuery API",
    description="RAG-powered code analysis API",
    version="1.0.0"
)

# CORS middleware for NextJS frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # NextJS dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {
        "message": "Welcome to CodeQuery API",
        "version": "1.0.0", 
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}