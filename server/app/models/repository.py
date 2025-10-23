from sqlalchemy import Column, Integer, String, DateTime, Text, Enum
from sqlalchemy.sql import func
from app.database import Base
import enum

# Define enum to match database exactly
class RepositoryStatusEnum(enum.Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    READY = "READY"
    FAILED = "FAILED"

class Repository(Base):
    __tablename__ = "repositories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    github_url = Column(String, nullable=False)
    name = Column(String, nullable=False)
    status = Column(Enum(RepositoryStatusEnum), default=RepositoryStatusEnum.PENDING)
    error_message = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())