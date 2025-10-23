from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional, Dict, Any

class CodeCitation(BaseModel):
    file_path: str
    start_line: int
    end_line: int
    code_snippet: str

class MessageCreate(BaseModel):
    content: str

class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    citations: Optional[List[CodeCitation]] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    id: int
    repository_id: int
    title: str
    messages: List[MessageResponse]
    created_at: datetime
    
    class Config:
        from_attributes = True

class QueryRequest(BaseModel):
    question: str
    conversation_id: Optional[int] = None

class QueryResponse(BaseModel):
    answer_id: str
    natural_language_answer: str
    citations: List[CodeCitation]
    conversation_id: int
