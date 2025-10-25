from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Header
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.repository import Repository, RepositoryStatusEnum
from app.schemas.repository import RepositoryCreate, RepositoryResponse
from app.core.config import settings
from app.services import GitHubService, EmbeddingService, VectorService
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

async def process_repository_background(repository_id: int, user_id: str):
    """Background task to process repository with hybrid RAG"""
    logger.info(f"🚀 Starting QODEX HYBRID RAG processing for repository {repository_id} (user: {user_id})")
    
    from app.database import SessionLocal
    db = SessionLocal()
    
    github_service = GitHubService()
    embedding_service = EmbeddingService()
    vector_service = VectorService()
    
    temp_dir = None
    
    try:
        repository = db.query(Repository).filter(
            Repository.id == repository_id,
            Repository.user_id == user_id
        ).first()
        
        if not repository:
            logger.error(f"❌ Repository {repository_id} not found for user {user_id}")
            return
        
        repository.status = RepositoryStatusEnum.PROCESSING
        db.commit()
        logger.info(f"📊 Repository {repository_id} status: PROCESSING")
        
        logger.info(f"📥 Step 1: Cloning repository {repository.github_url}")
        temp_dir = await github_service.clone_repository(repository.github_url)
        
        logger.info(f"📁 Step 2: Extracting code files from {repository.name}")
        code_chunks = await github_service.extract_code_files(temp_dir)
        
        if not code_chunks:
            raise Exception("No supported code files found in repository")
        
        logger.info(f"✅ Found {len(code_chunks)} code chunks")
        
        logger.info(f"⚡ Step 3: Generating embeddings with LOCAL SentenceTransformers")
        embedded_chunks = await embedding_service.generate_embeddings_batch(code_chunks)
        
        if not embedded_chunks:
            raise Exception("Failed to generate local embeddings")
        
        logger.info(f"💾 Step 4: Storing embeddings in ChromaDB")
        await vector_service.store_embeddings(repository_id, embedded_chunks)
        
        repository.status = RepositoryStatusEnum.READY
        repository.error_message = None
        db.commit()
        
        logger.info(f"🎉 SUCCESS! QODEX Repository {repository_id} is READY for chat! (user: {user_id})")
        
    except Exception as e:
        error_message = str(e)
        logger.error(f"❌ Error processing repository {repository_id}: {error_message}")
        
        try:
            repository = db.query(Repository).filter(Repository.id == repository_id).first()
            if repository:
                repository.status = RepositoryStatusEnum.FAILED
                repository.error_message = error_message[:500]
                db.commit()
        except Exception as db_error:
            logger.error(f"❌ Failed to update repository status: {str(db_error)}")
    
    finally:
        if temp_dir:
            github_service.cleanup_temp_dir(temp_dir)
        db.close()

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

@router.post("/", response_model=RepositoryResponse)
async def add_repository(
    repository: RepositoryCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id),
    _: bool = Depends(verify_client_secret)
):
    """Add new repository for QODEX processing"""
    
    # Verify user_id matches between header and body
    if repository.user_id != user_id:
        raise HTTPException(status_code=400, detail="User ID mismatch between header and body")
    
    logger.info(f"📥 NEW QODEX REQUEST: {repository.name} - {repository.github_url} (user: {user_id})")
    
    # Validate GitHub URL
    if not repository.github_url.startswith(('https://github.com/', 'git@github.com:')):
        raise HTTPException(status_code=400, detail="Invalid GitHub URL format")
    
    # Check for duplicates for this user
    existing = db.query(Repository).filter(
        Repository.github_url == repository.github_url,
        Repository.user_id == user_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=400, 
            detail=f"Repository already exists with ID: {existing.id}. Status: {existing.status.value}"
        )
    
    # Create repository record
    db_repository = Repository(
        name=repository.name,
        github_url=repository.github_url,
        user_id=user_id,
        status=RepositoryStatusEnum.PENDING
    )
    db.add(db_repository)
    db.commit()
    db.refresh(db_repository)
    
    # Start background processing
    background_tasks.add_task(process_repository_background, db_repository.id, user_id)
    
    logger.info(f"✅ Repository {db_repository.id} created and queued for processing (user: {user_id})")
    return db_repository

@router.get("/", response_model=List[RepositoryResponse])
async def get_user_repositories(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id),
    _: bool = Depends(verify_client_secret)
):
    """Get all repositories for the authenticated user"""
    repositories = db.query(Repository).filter(
        Repository.user_id == user_id
    ).order_by(Repository.created_at.desc()).all()
    
    logger.info(f"📋 Retrieved {len(repositories)} repositories for user {user_id}")
    return repositories

@router.get("/{repository_id}", response_model=RepositoryResponse)
async def get_repository(
    repository_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id),
    _: bool = Depends(verify_client_secret)
):
    """Get specific repository by ID (user must own it)"""
    repository = db.query(Repository).filter(
        Repository.id == repository_id,
        Repository.user_id == user_id
    ).first()
    
    if not repository:
        raise HTTPException(status_code=404, detail="Repository not found or access denied")
    
    return repository

@router.delete("/{repository_id}")
async def delete_repository(
    repository_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id),
    _: bool = Depends(verify_client_secret)
):
    """Delete repository and all associated data (user must own it)"""
    repository = db.query(Repository).filter(
        Repository.id == repository_id,
        Repository.user_id == user_id
    ).first()
    
    if not repository:
        raise HTTPException(status_code=404, detail="Repository not found or access denied")
    
    try:
        # Delete vector data from ChromaDB
        vector_service = VectorService()
        await vector_service.delete_repository_data(repository_id)
        logger.info(f"🗑️ Deleted vector data for repository {repository_id}")
    except Exception as e:
        logger.warning(f"⚠️ Error deleting vector data for repo {repository_id}: {e}")
    
    try:
        # Delete conversations and messages (CASCADE should handle this)
        db.delete(repository)
        db.commit()
        logger.info(f"🗑️ Successfully deleted repository {repository_id} (user: {user_id})")
    except Exception as e:
        logger.error(f"❌ Error deleting repository {repository_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete repository")
    
    return {
        "message": f"Repository {repository_id} deleted successfully",
        "repository_id": repository_id,
        "user_id": user_id,
        "success": True
    }

@router.get("/{repository_id}/status")
async def get_repository_status(
    repository_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id),
    _: bool = Depends(verify_client_secret)
):
    """Get detailed repository status (user must own it)"""
    repository = db.query(Repository).filter(
        Repository.id == repository_id,
        Repository.user_id == user_id
    ).first()
    
    if not repository:
        raise HTTPException(status_code=404, detail="Repository not found or access denied")
    
    # Count conversations for this repository
    from app.models.conversation import Conversation
    conversation_count = db.query(Conversation).filter(
        Conversation.repository_id == repository_id
    ).count()
    
    return {
        "id": repository.id,
        "user_id": repository.user_id,
        "name": repository.name,
        "github_url": repository.github_url,
        "status": repository.status.value,
        "error_message": repository.error_message,
        "created_at": repository.created_at,
        "updated_at": repository.updated_at,
        "is_ready_for_chat": repository.status == RepositoryStatusEnum.READY,
        "conversation_count": conversation_count,
        "processing_complete": repository.status in [RepositoryStatusEnum.READY, RepositoryStatusEnum.FAILED]
    }

# ✅ NEW: User-specific routes
@router.get("/users/{target_user_id}/repositories", response_model=List[RepositoryResponse])
async def get_specific_user_repositories(
    target_user_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id),
    _: bool = Depends(verify_client_secret)
):
    """Get repositories for a specific user (must be same user)"""
    
    # Security: Users can only access their own repositories
    if user_id != target_user_id:
        raise HTTPException(status_code=403, detail="Access denied - can only access your own repositories")
    
    repositories = db.query(Repository).filter(
        Repository.user_id == target_user_id
    ).order_by(Repository.created_at.desc()).all()
    
    return repositories