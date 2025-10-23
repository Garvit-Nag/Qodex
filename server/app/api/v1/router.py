from fastapi import APIRouter
from .repositories import router as repositories_router
from .chat import router as chat_router

api_router = APIRouter()

# Include only core functionality
api_router.include_router(repositories_router, prefix="/repositories", tags=["repositories"])
api_router.include_router(chat_router, prefix="/chat", tags=["chat"])