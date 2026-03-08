# 🏢 Enterprise Knowledge Assistant

An AI-powered RAG (Retrieval-Augmented Generation) application that allows enterprises to upload SOP documents and query them using natural language.

![Tech Stack](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![LangChain](https://img.shields.io/badge/LangChain-000000?style=flat)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-4285F4?style=flat&logo=google&logoColor=white)
![ChromaDB](https://img.shields.io/badge/ChromaDB-FF6B6B?style=flat)

##  Features

- 📄 Upload PDF and Word documents
- 🤖 AI-powered Q&A using Google Gemini
- 🔍 Semantic search with ChromaDB vector database
- 💬 Conversation memory per session
- 📚 Source citations in answers
- 🎨 Modern dark UI with React + Tailwind CSS

##  Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | FastAPI + Python |
| AI/LLM | Google Gemini 2.0 Flash |
| RAG Framework | LangChain |
| Vector Database | ChromaDB |
| Embeddings | Google Generative AI Embeddings |
| Document Parsing | pypdfium2 + python-docx |

##  Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- Google Gemini API Key from [aistudio.google.com](https://aistudio.google.com)

# Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
cp .env.example .env   # Add your API key
uvicorn main:app --reload
```

# Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

# Open App
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

# API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/chat/` | Ask a question |
| POST | `/documents/upload` | Upload document |
| GET | `/documents/` | List documents |
| DELETE | `/documents/{filename}` | Delete document |

# Project Structure
```
enterprise-knowledge-assistant/
├── backend/
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   ├── models/          # Pydantic schemas
│   ├── uploads/         # Uploaded files
│   ├── vectorstore/     # ChromaDB data
│   └── main.py          # FastAPI app
└── frontend/
    └── src/
        ├── components/  # Reusable UI
        ├── pages/       # App screens
        └── api/         # API client
```

# Environment Variables
```env
GOOGLE_API_KEY=your_gemini_api_key
CHROMA_PERSIST_DIR=./vectorstore
UPLOAD_DIR=./uploads
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
MAX_RETRIEVAL_DOCS=5
```

# Author

**Mahesh Chithini**
- GitHub: [@maheshchithini-dotcom](https://github.com/maheshchithini-dotcom)
