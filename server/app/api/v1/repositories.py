from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.repository import Repository, RepositoryStatusEnum
from app.schemas.repository import RepositoryCreate, RepositoryResponse
from app.middleware.auth import verify_api_key_header
from app.services import GitHubService, EmbeddingService, VectorService
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

async def process_repository_background(repository_id: int):
    logger.info(f"🚀 Starting HYBRID RAG processing for repository {repository_id}")
    
    from app.database import SessionLocal
    db = SessionLocal()
    
    github_service = GitHubService()
    embedding_service = EmbeddingService()
    vector_service = VectorService()
    
    temp_dir = None
    
    try:
        repository = db.query(Repository).filter(Repository.id == repository_id).first()
        if not repository:
            logger.error(f"❌ Repository {repository_id} not found")
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
        
        logger.info(f"⚡ Step 3: Generating embeddings with LOCAL model")
        embedded_chunks = await embedding_service.generate_embeddings_batch(code_chunks)
        
        if not embedded_chunks:
            raise Exception("Failed to generate local embeddings")
        
        logger.info(f"💾 Step 4: Storing embeddings in ChromaDB")
        await vector_service.store_embeddings(repository_id, embedded_chunks)
        
        repository.status = RepositoryStatusEnum.READY
        repository.error_message = None
        db.commit()
        
        logger.info(f"🎉 SUCCESS! Repository {repository_id} is READY for chat!")
        
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

@router.post("/", response_model=RepositoryResponse, dependencies=[Depends(verify_api_key_header)])
async def add_repository(
    repository: RepositoryCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    logger.info(f"📥 NEW HYBRID RAG REQUEST: {repository.name} - {repository.github_url}")
    
    if not repository.github_url.startswith(('https://github.com/', 'git@github.com:')):
        raise HTTPException(status_code=400, detail="Invalid GitHub URL")
    
    existing = db.query(Repository).filter(Repository.github_url == repository.github_url).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Repository already exists with ID: {existing.id}")
    
    db_repository = Repository(
        name=repository.name,
        github_url=repository.github_url,
        user_id=None,
        status=RepositoryStatusEnum.PENDING
    )
    db.add(db_repository)
    db.commit()
    db.refresh(db_repository)
    
    background_tasks.add_task(process_repository_background, db_repository.id)
    
    return db_repository

@router.get("/", response_model=List[RepositoryResponse], dependencies=[Depends(verify_api_key_header)])
async def get_repositories(db: Session = Depends(get_db)):
    repositories = db.query(Repository).order_by(Repository.created_at.desc()).all()
    return repositories

@router.delete("/{repository_id}", dependencies=[Depends(verify_api_key_header)])
async def delete_repository(repository_id: int, db: Session = Depends(get_db)):
    repository = db.query(Repository).filter(Repository.id == repository_id).first()
    if not repository:
        raise HTTPException(status_code=404, detail="Repository not found")
    
    try:
        vector_service = VectorService()
        vector_service.delete_repository_data(repository_id)
    except Exception as e:
        logger.warning(f"⚠️ Error deleting vector data: {e}")
    
    db.delete(repository)
    db.commit()
    
    return {"message": "Repository deleted successfully"}

@router.get("/{repository_id}/status")
async def get_repository_status(repository_id: int, db: Session = Depends(get_db)):
    repository = db.query(Repository).filter(Repository.id == repository_id).first()
    if not repository:
        raise HTTPException(status_code=404, detail="Repository not found")
    
    return {
        "id": repository.id,
        "name": repository.name,
        "github_url": repository.github_url,
        "status": repository.status.value,
        "error_message": repository.error_message,
        "created_at": repository.created_at,
        "updated_at": repository.updated_at,
        "is_ready_for_chat": repository.status == RepositoryStatusEnum.READY
    }