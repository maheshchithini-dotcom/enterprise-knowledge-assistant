
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ChatRequest(BaseModel):
    question: str
    session_id: Optional[str] = "default"
    chat_history: Optional[List[dict]] = []


class ChatResponse(BaseModel):
    answer: str
    sources: List[dict]
    session_id: str


class DocumentResponse(BaseModel):
    id: str
    filename: str
    status: str
    chunks_created: int
    uploaded_at: datetime


class DocumentListResponse(BaseModel):
    documents: List[DocumentResponse]
    total: int


class DeleteResponse(BaseModel):
    message: str
    filename: str


class HealthResponse(BaseModel):
    status: str
    vectorstore_docs: int
    message: str