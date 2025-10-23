from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

class RepositoryStatus(str, Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    READY = "READY"
    FAILED = "FAILED"

class RepositoryCreate(BaseModel):
    name: str
    github_url: str

class RepositoryResponse(BaseModel):
    id: int
    name: str
    github_url: str
    status: RepositoryStatus
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    user_id: Optional[int] = None
    
    class Config:
        from_attributes = True