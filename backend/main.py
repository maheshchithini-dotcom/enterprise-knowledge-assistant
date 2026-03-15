
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.chat import router as chat_router
from routes.documents import router as documents_router
from services.vectorstore import get_document_count
from models.schemas import HealthResponse
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Enterprise Knowledge Assistant API",
    description="RAG-powered API for querying SOP documents using Google Gemini + LangChain + ChromaDB",
    version="1.0.0",
)

# CORS - allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://enterprise-knowledge-assistant-five.vercel.app",
        "https://enterprise-knowledge-assistant-git-9ce17b-maheshchithini-dotcoms-projects.vercel.app",
        "https://enterprise-knowledge-assistant-71jyfzu9v.vercel.app",
        "https://enterprise-knowledge-assistant-seven.vercel.app",
        "https://enterprise-knowledge-assistant-g7dtw3a45.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Register routers
app.include_router(chat_router)
app.include_router(documents_router)


@app.get("/", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    doc_count = get_document_count()
    return HealthResponse(
        status="healthy",
        vectorstore_docs=doc_count,
        message=f"Enterprise Knowledge Assistant is running. {doc_count} document chunks indexed.",
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)