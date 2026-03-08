import os
from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_core.documents import Document
from dotenv import load_dotenv

load_dotenv(override=True)

CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./vectorstore")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# Singleton vectorstore instance
_vectorstore = None


def get_embeddings():
    """Return Google Generative AI embeddings model."""
    api_key = os.getenv("GOOGLE_API_KEY")
    print(f"DEBUG - API KEY LOADED: {api_key[:10] if api_key else 'NONE'}...")
    os.environ["GOOGLE_API_KEY"] = api_key
    return GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-001",
        google_api_key=api_key,
        transport="rest",
    )


def get_vectorstore() -> Chroma:
    """Return or initialize the ChromaDB vectorstore."""
    global _vectorstore
    if _vectorstore is None:
        _vectorstore = Chroma(
            collection_name="sop_documents",
            embedding_function=get_embeddings(),
            persist_directory=CHROMA_PERSIST_DIR,
        )
    return _vectorstore


def add_documents(documents: list) -> int:
    """Add documents to the vectorstore."""
    vs = get_vectorstore()
    vs.add_documents(documents)
    return len(documents)


def similarity_search(query: str, k: int = 5) -> list:
    """Retrieve top-k relevant documents for a query."""
    vs = get_vectorstore()
    return vs.similarity_search(query, k=k)


def delete_documents_by_source(filename: str) -> bool:
    """Delete all chunks belonging to a specific document."""
    vs = get_vectorstore()
    results = vs.get(where={"source": filename})
    if results and results.get("ids"):
        vs.delete(ids=results["ids"])
        return True
    return False


def get_all_document_sources() -> list:
    """Get a list of all unique documents in the vectorstore."""
    vs = get_vectorstore()
    results = vs.get()
    if not results or not results.get("metadatas"):
        return []

    seen = {}
    for metadata in results["metadatas"]:
        source = metadata.get("source", "unknown")
        doc_id = metadata.get("doc_id", "unknown")
        if source not in seen:
            seen[source] = {"filename": source, "doc_id": doc_id, "chunk_count": 1}
        else:
            seen[source]["chunk_count"] += 1

    return list(seen.values())


def get_document_count() -> int:
    """Return total number of chunks in the vectorstore."""
    vs = get_vectorstore()
    return vs._collection.count()

### Restart and upload — then check terminal for:
#DEBUG - API KEY LOADED: AIzaSyAhgw...