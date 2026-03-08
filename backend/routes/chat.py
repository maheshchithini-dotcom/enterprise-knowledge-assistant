from fastapi import APIRouter, HTTPException
from models.schemas import ChatRequest, ChatResponse
from services.rag_service import ask_question, clear_session
from services.vectorstore import get_document_count

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Ask a question and get an answer from the SOP knowledge base."""

    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    doc_count = get_document_count()
    if doc_count == 0:
        raise HTTPException(
            status_code=400,
            detail="No documents have been uploaded yet. Please upload SOP documents first."
        )

    try:
        result = await ask_question(
            question=request.question,
            session_id=request.session_id or "default",
        )
        return ChatResponse(**result)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process question: {str(e)}")


@router.delete("/session/{session_id}")
async def clear_chat_session(session_id: str):
    """Clear conversation history for a session."""
    clear_session(session_id)
    return {"message": f"Session '{session_id}' cleared successfully"}