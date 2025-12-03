from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class CodeFile(Base):
    """Store full file contents for complete AI context"""
    __tablename__ = "code_files"
    
    id = Column(Integer, primary_key=True, index=True)
    repository_id = Column(Integer, ForeignKey("repositories.id", ondelete="CASCADE"), nullable=False)
    file_path = Column(String(500), nullable=False)
    full_content = Column(Text, nullable=False)  # Complete file chunk content
    chunk_index = Column(Integer, nullable=False)
    start_line = Column(Integer, nullable=False)
    end_line = Column(Integer, nullable=False)
    chunk_type = Column(String(50), nullable=False)  # 'full_file' or 'code_block'
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    repository = relationship("Repository", back_populates="code_files")
    
    # Composite index for fast lookups
    __table_args__ = (
        Index('ix_code_files_repo_file_chunk', 'repository_id', 'file_path', 'chunk_index'),
        Index('ix_code_files_repo_id', 'repository_id'),
    )
