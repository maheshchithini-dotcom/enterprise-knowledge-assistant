import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from services.vectorstore import get_vectorstore
from dotenv import load_dotenv

load_dotenv()

from dotenv import load_dotenv
load_dotenv(override=True)
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
MAX_RETRIEVAL_DOCS = int(os.getenv("MAX_RETRIEVAL_DOCS", 5))

# Session memory store: session_id -> list of messages
_session_memories: dict = {}

SYSTEM_PROMPT = """You are an intelligent Enterprise Knowledge Assistant specialized in answering questions based on Standard Operating Procedures (SOPs) and company documents.

Use the following retrieved context from SOP documents to answer the user's question accurately and professionally.

Guidelines:
- Answer based ONLY on the provided context
- If the answer is not in the context, say "I couldn't find this information in the available SOP documents"
- Be concise but thorough
- Cite the source document when relevant
- Use bullet points or numbered steps for procedural answers
- Maintain a professional, helpful tone

Context from SOP Documents:
{context}

Chat History:
{chat_history}

Question: {question}

Answer:"""

QA_PROMPT = PromptTemplate(
    input_variables=["context", "chat_history", "question"],
    template=SYSTEM_PROMPT,
)

def get_llm():
    os.environ["GOOGLE_API_KEY"] = GOOGLE_API_KEY
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0.1,
        convert_system_message_to_human=True,
    )


def format_docs(docs):
    """Format retrieved documents into a single string."""
    return "\n\n".join(doc.page_content for doc in docs)


def get_chat_history(session_id: str) -> str:
    """Get formatted chat history for a session."""
    history = _session_memories.get(session_id, [])
    if not history:
        return "No previous conversation."
    formatted = ""
    for msg in history[-10:]:
        formatted += f"Human: {msg['question']}\nAssistant: {msg['answer']}\n\n"
    return formatted


def save_to_memory(session_id: str, question: str, answer: str):
    """Save Q&A to session memory."""
    if session_id not in _session_memories:
        _session_memories[session_id] = []
    _session_memories[session_id].append({
        "question": question,
        "answer": answer
    })


async def ask_question(question: str, session_id: str = "default") -> dict:
    """
    Run a question through the RAG pipeline.
    Returns answer and source documents.
    """
    vectorstore = get_vectorstore()
    retriever = vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": MAX_RETRIEVAL_DOCS},
    )

    # Retrieve relevant documents
    docs = retriever.invoke(question)
    context = format_docs(docs)
    chat_history = get_chat_history(session_id)

    # Build and run chain
    llm = get_llm()
    chain = QA_PROMPT | llm | StrOutputParser()

    answer = chain.invoke({
        "context": context,
        "chat_history": chat_history,
        "question": question,
    })

    # Save to memory
    save_to_memory(session_id, question, answer)

    # Format source documents
    sources = []
    seen_sources = set()
    for doc in docs:
        source = doc.metadata.get("source", "Unknown")
        if source not in seen_sources:
            seen_sources.add(source)
            sources.append({
                "filename": source,
                "doc_id": doc.metadata.get("doc_id", ""),
                "chunk_index": doc.metadata.get("chunk_index", 0),
                "excerpt": doc.page_content[:200] + "..." if len(doc.page_content) > 200 else doc.page_content,
            })

    return {
        "answer": answer,
        "sources": sources,
        "session_id": session_id,
    }


def clear_session(session_id: str):
    """Clear conversation memory for a session."""
    if session_id in _session_memories:
        del _session_memories[session_id]