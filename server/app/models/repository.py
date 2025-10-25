from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class RepositoryStatusEnum(enum.Enum):
    """Repository processing status"""
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    READY = "READY"
    FAILED = "FAILED"

class Repository(Base):
    """Repository model with user ownership"""
    __tablename__ = "repositories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False, index=True)  # ✅ Added back!
    github_url = Column(String, nullable=False, unique=True)
    name = Column(String, nullable=False)
    status = Column(Enum(RepositoryStatusEnum), default=RepositoryStatusEnum.PENDING)
    error_message = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    conversations = relationship("Conversation", back_populates="repository", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Repository(id={self.id}, user_id='{self.user_id}', name='{self.name}', status={self.status.value})>"