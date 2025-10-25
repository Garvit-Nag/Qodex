from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.repository import Repository, RepositoryStatusEnum
from app.models.conversation import Conversation, Message
from app.core.config import settings
from app.services import EmbeddingService, VectorService, ChatService
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Define the models directly in this file
class ChatRequest(BaseModel):
    """Request model for chat with repository"""
    query: str
    repository_id: int

class ChatResponse(BaseModel):
    """Response model for chat"""
    response: str
    sources: List[dict]
    repository_name: str
    context_chunks_used: int
    model_used: str
    success: bool

def verify_client_secret(x_client_secret: str = Header(..., alias="X-Client-Secret")):
    """Verify request comes from authorized Next.js client"""
    if x_client_secret != settings.nextjs_secret:
        raise HTTPException(
            status_code=403, 
            detail="Unauthorized client - invalid secret"
        )
    return True

def get_user_id(x_user_id: str = Header(..., alias="X-User-ID")):
    """Extract and validate user ID from header"""
    if not x_user_id or len(x_user_id.strip()) == 0:
        raise HTTPException(status_code=400, detail="User ID required")
    return x_user_id.strip()

def verify_repository_ownership(repository_id: int, user_id: str, db: Session):
    """Verify user owns the repository"""
    repository = db.query(Repository).filter(
        Repository.id == repository_id,
        Repository.user_id == user_id
    ).first()
    
    if not repository:
        raise HTTPException(status_code=404, detail="Repository not found or access denied")
    
    return repository

@router.post("/", response_model=ChatResponse)
async def chat_with_repository(
    request: ChatRequest,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id),
    _: bool = Depends(verify_client_secret)
):
    """Chat with a repository using QODEX AI"""
    logger.info(f"💬 QODEX Chat: '{request.query[:60]}...' for repo {request.repository_id} (user: {user_id})")
    
    # Verify repository ownership
    repository = verify_repository_ownership(request.repository_id, user_id, db)
    
    if repository.status != RepositoryStatusEnum.READY:
        status_messages = {
            RepositoryStatusEnum.PENDING: "Repository is pending processing. Please wait.",
            RepositoryStatusEnum.PROCESSING: "Repository is currently being processed. Please wait.",
            RepositoryStatusEnum.FAILED: f"Repository processing failed: {repository.error_message}"
        }
        raise HTTPException(
            status_code=400, 
            detail=status_messages.get(repository.status, "Repository not ready for chat")
        )
    
    try:
        # Initialize services
        embedding_service = EmbeddingService()
        vector_service = VectorService()
        chat_service = ChatService()
        
        # Generate query embedding
        logger.info(f"🔍 Generating embedding for query...")
        query_embedding = await embedding_service.generate_query_embedding(request.query)
        
        # Search for similar code chunks
        logger.info(f"🔎 Searching for relevant code chunks...")
        similar_chunks = await vector_service.search_similar_code(
            repository_id=request.repository_id,
            query_embedding=query_embedding,
            top_k=5
        )
        
        if not similar_chunks:
            logger.warning(f"⚠️ No relevant chunks found for query in repo {request.repository_id}")
            return ChatResponse(
                response="I couldn't find any relevant code chunks for your question. Try asking about something more specific to this repository, or check if the repository was processed correctly.",
                sources=[],
                repository_name=repository.name,
                context_chunks_used=0,
                model_used="no_results",
                success=False
            )
        
        logger.info(f"✅ Found {len(similar_chunks)} relevant code chunks")
        
        # Generate AI response
        logger.info(f"🤖 Generating AI response with Gemini...")
        ai_response = await chat_service.generate_response(
            query=request.query,
            code_chunks=similar_chunks,
            repository_name=repository.name
        )
        
        # Save conversation if successful
        if ai_response['success']:
            try:
                # Create or get conversation
                conversation = db.query(Conversation).filter(
                    Conversation.repository_id == request.repository_id
                ).first()
                
                if not conversation:
                    conversation = Conversation(
                        repository_id=request.repository_id,
                        title=f"Chat about {repository.name}"
                    )
                    db.add(conversation)
                    db.commit()
                    db.refresh(conversation)
                
                # Save user message
                user_message = Message(
                    conversation_id=conversation.id,
                    role="user",
                    content=request.query
                )
                db.add(user_message)
                
                # Save assistant response
                assistant_message = Message(
                    conversation_id=conversation.id,
                    role="assistant",
                    content=ai_response['response'],
                    citations=ai_response['sources']
                )
                db.add(assistant_message)
                
                db.commit()
                logger.info(f"💾 Saved conversation for repo {request.repository_id} (user: {user_id})")
                
            except Exception as save_error:
                logger.warning(f"⚠️ Failed to save conversation: {save_error}")
                # Continue anyway - don't fail the response
        
        logger.info(f"🎉 QODEX chat successful for repo {request.repository_id} (user: {user_id})")
        
        return ChatResponse(
            response=ai_response['response'],
            sources=ai_response['sources'],
            repository_name=repository.name,
            context_chunks_used=len(similar_chunks),
            model_used=ai_response['model_used'],
            success=ai_response['success']
        )
        
    except Exception as e:
        logger.error(f"❌ Error in QODEX chat processing: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to process chat request: {str(e)}"
        )

# ✅ NEW: Direct messages route (Option 1 solution!)
@router.get("/{repository_id}/messages")
async def get_repository_chat_messages(
    repository_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id),
    _: bool = Depends(verify_client_secret)
):
    """Get all chat messages for a repository directly - SINGLE API CALL!"""
    
    # Verify repository ownership
    repository = verify_repository_ownership(repository_id, user_id, db)
    
    # Get conversation for this repository
    conversation = db.query(Conversation).filter(
        Conversation.repository_id == repository_id
    ).first()
    
    if not conversation:
        return {
            "repository_id": repository_id,
            "repository_name": repository.name,
            "user_id": user_id,
            "conversation_id": None,
            "messages": [],
            "total_messages": 0
        }
    
    # Get all messages
    messages = db.query(Message).filter(
        Message.conversation_id == conversation.id
    ).order_by(Message.created_at.asc()).all()
    
    return {
        "repository_id": repository_id,
        "repository_name": repository.name,
        "user_id": user_id,
        "conversation_id": conversation.id,
        "messages": [
            {
                "id": msg.id,
                "role": msg.role,
                "content": msg.content,
                "citations": msg.citations,
                "created_at": msg.created_at
            }
            for msg in messages
        ],
        "total_messages": len(messages)
    }

@router.get("/{repository_id}/conversations")
async def get_repository_conversations(
    repository_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id),
    _: bool = Depends(verify_client_secret)
):
    """Get all conversations for a repository (user must own it)"""
    
    # Verify repository ownership
    repository = verify_repository_ownership(repository_id, user_id, db)
    
    conversations = db.query(Conversation).filter(
        Conversation.repository_id == repository_id
    ).order_by(Conversation.created_at.desc()).all()
    
    return {
        "repository_id": repository_id,
        "repository_name": repository.name,
        "user_id": user_id,
        "conversations": conversations,
        "total_conversations": len(conversations)
    }

@router.get("/conversations/{conversation_id}/messages")
async def get_conversation_messages(
    conversation_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id),
    _: bool = Depends(verify_client_secret)
):
    """Get all messages in a conversation (user must own the repository)"""
    
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Verify user owns the repository
    verify_repository_ownership(conversation.repository_id, user_id, db)
    
    messages = db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at.asc()).all()
    
    return {
        "conversation_id": conversation_id,
        "repository_id": conversation.repository_id,
        "user_id": user_id,
        "messages": messages,
        "total_messages": len(messages)
    }

# ✅ NEW: User-specific chat routes
@router.get("/users/{target_user_id}/conversations")
async def get_user_all_conversations(
    target_user_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id),
    _: bool = Depends(verify_client_secret)
):
    """Get all conversations for a specific user across all their repositories"""
    
    # Security: Users can only access their own conversations
    if user_id != target_user_id:
        raise HTTPException(status_code=403, detail="Access denied - can only access your own conversations")
    
    # Get all repositories for this user
    user_repos = db.query(Repository).filter(Repository.user_id == target_user_id).all()
    repo_ids = [repo.id for repo in user_repos]
    
    if not repo_ids:
        return {
            "user_id": target_user_id,
            "total_conversations": 0,
            "conversations": []
        }
    
    # Get all conversations for user's repositories
    conversations = db.query(Conversation).filter(
        Conversation.repository_id.in_(repo_ids)
    ).order_by(Conversation.created_at.desc()).all()
    
    return {
        "user_id": target_user_id,
        "total_conversations": len(conversations),
        "conversations": [
            {
                "id": conv.id,
                "repository_id": conv.repository_id,
                "repository_name": conv.repository.name,
                "title": conv.title,
                "created_at": conv.created_at,
                "message_count": len(conv.messages)
            }
            for conv in conversations
        ]
    }

@router.post("/{repository_id}/test")
async def test_repository_search(
    repository_id: int,
    query: str = "main function",
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id),
    _: bool = Depends(verify_client_secret)
):
    """Test endpoint to verify repository search functionality (user must own it)"""
    
    # Verify repository ownership
    repository = verify_repository_ownership(repository_id, user_id, db)
    
    if repository.status != RepositoryStatusEnum.READY:
        raise HTTPException(status_code=400, detail="Repository not ready")
    
    try:
        embedding_service = EmbeddingService()
        vector_service = VectorService()
        
        query_embedding = await embedding_service.generate_query_embedding(query)
        results = await vector_service.search_similar_code(repository_id, query_embedding, top_k=3)
        
        return {
            "repository": repository.name,
            "user_id": user_id,
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
            ],
            "test_successful": len(results) > 0
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Test failed: {str(e)}")