
import os
import uuid
import aiofiles
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, HTTPException
from models.schemas import DocumentResponse, DocumentListResponse, DeleteResponse
from services.doc_processor import process_document
from services.vectorstore import add_documents, delete_documents_by_source, get_all_document_sources
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/documents", tags=["Documents"])

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc"}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB

# In-memory document metadata store
document_store: dict = {}


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(file: UploadFile = File(...)):
    """Upload and ingest a PDF or Word document into the knowledge base."""

    # Validate file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: PDF, DOCX, DOC"
        )

    # Read and validate file size
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds 50MB limit")

    # Save file to disk
    safe_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)

    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)

    try:
        # Process and chunk document
        documents, doc_id = process_document(file_path, file.filename)

        # Add to vectorstore
        chunks_added = add_documents(documents)

        # Store metadata
        doc_meta = DocumentResponse(
            id=doc_id,
            filename=file.filename,
            status="indexed",
            chunks_created=chunks_added,
            uploaded_at=datetime.utcnow(),
        )
        document_store[file.filename] = doc_meta

        return doc_meta

    except Exception as e:
        # Cleanup file on failure (Windows safe)
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception:
            pass
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")

@router.get("/", response_model=DocumentListResponse)
async def list_documents():
    """List all documents currently indexed in the knowledge base."""
    sources = get_all_document_sources()

    docs = []
    for src in sources:
        filename = src["filename"]
        if filename in document_store:
            docs.append(document_store[filename])
        else:
            docs.append(DocumentResponse(
                id=src["doc_id"],
                filename=filename,
                status="indexed",
                chunks_created=src["chunk_count"],
                uploaded_at=datetime.utcnow(),
            ))

    return DocumentListResponse(documents=docs, total=len(docs))


@router.delete("/{filename}", response_model=DeleteResponse)
async def delete_document(filename: str):
    """Remove a document from the knowledge base."""
    deleted = delete_documents_by_source(filename)

    if not deleted:
        raise HTTPException(status_code=404, detail=f"Document '{filename}' not found")

    if filename in document_store:
        del document_store[filename]

    return DeleteResponse(message="Document deleted successfully", filename=filename)