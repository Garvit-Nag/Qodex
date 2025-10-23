from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.repository import Repository, RepositoryStatusEnum
from app.services import EmbeddingService, VectorService, ChatService
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class ChatRequest(BaseModel):
    query: str
    repository_id: int

class ChatResponse(BaseModel):
    response: str
    sources: List[dict]
    repository_name: str
    context_chunks_used: int
    model_used: str
    success: bool

@router.post("/", response_model=ChatResponse)
async def chat_with_code(request: ChatRequest, db: Session = Depends(get_db)):
    logger.info(f"💬 Chat request: '{request.query[:60]}...' for repo {request.repository_id}")
    
    repository = db.query(Repository).filter(Repository.id == request.repository_id).first()
    if not repository:
        raise HTTPException(status_code=404, detail="Repository not found")
    
    if repository.status != RepositoryStatusEnum.READY:
        status_messages = {
            RepositoryStatusEnum.PENDING: "Repository is pending processing.",
            RepositoryStatusEnum.PROCESSING: "Repository is currently being processed.",
            RepositoryStatusEnum.FAILED: f"Repository processing failed: {repository.error_message}"
        }
        raise HTTPException(status_code=400, detail=status_messages.get(repository.status, "Repository not ready"))
    
    try:
        embedding_service = EmbeddingService()
        vector_service = VectorService()
        chat_service = ChatService()
        
        query_embedding = await embedding_service.generate_query_embedding(request.query)
        
        similar_chunks = await vector_service.search_similar_code(
            repository_id=request.repository_id,
            query_embedding=query_embedding,
            top_k=5
        )
        
        if not similar_chunks:
            return ChatResponse(
                response="I couldn't find any relevant code chunks for your question. Try asking about something more specific to this repository.",
                sources=[],
                repository_name=repository.name,
                context_chunks_used=0,
                model_used="no_results",
                success=False
            )
        
        ai_response = await chat_service.generate_response(
            query=request.query,
            code_chunks=similar_chunks,
            repository_name=repository.name
        )
        
        return ChatResponse(
            response=ai_response['response'],
            sources=ai_response['sources'],
            repository_name=repository.name,
            context_chunks_used=len(similar_chunks),
            model_used=ai_response['model_used'],
            success=ai_response['success']
        )
        
    except Exception as e:
        logger.error(f"❌ Error in chat processing: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process chat request: {str(e)}")

@router.post("/test/{repository_id}")
async def test_repository_search(repository_id: int, query: str = "main function", db: Session = Depends(get_db)):
    repository = db.query(Repository).filter(Repository.id == repository_id).first()
    if not repository:
        raise HTTPException(status_code=404, detail="Repository not found")
    
    if repository.status != RepositoryStatusEnum.READY:
        raise HTTPException(status_code=400, detail="Repository not ready")
    
    try:
        embedding_service = EmbeddingService()
        vector_service = VectorService()
        
        query_embedding = await embedding_service.generate_query_embedding(query)
        results = await vector_service.search_similar_code(repository_id, query_embedding, top_k=3)
        
        return {
            "repository": repository.name,
            "query": query,
            "results_found": len(results),
            "top_matches": [
                {
                    "file": result['file_path'],
                    "lines": f"{result['start_line']}-{result['end_line']}",
                    "similarity": round(result['similarity'], 3),
                    "preview": result['content'][:200] + "..."
                }
                for result in results
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))