
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
})

// Chat API
export const sendMessage = (question, sessionId, chatHistory = []) =>
  api.post('/chat/', { question, session_id: sessionId, chat_history: chatHistory })

export const clearSession = (sessionId) =>
  api.delete(`/chat/session/${sessionId}`)

// Documents API
export const uploadDocument = (file, onProgress) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => onProgress && onProgress(Math.round((e.loaded * 100) / e.total)),
  })
}

export const listDocuments = () => api.get('/documents/')

export const deleteDocument = (filename) =>
  api.delete(`/documents/${encodeURIComponent(filename)}`)

// Health check
export const healthCheck = () => api.get('/')