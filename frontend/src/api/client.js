import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const sendMessage = (data) => client.post('/chat/', data)
export const clearSession = (sessionId) => client.delete(`/chat/session/${sessionId}`)
export const uploadDocument = (file, onProgress) => {
  const formData = new FormData()
  formData.append('file', file)
  return client.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => onProgress?.(Math.round((e.loaded * 100) / e.total)),
  })
}
export const listDocuments = () => client.get('/documents/')
export const deleteDocument = (filename) => client.delete(`/documents/${filename}`)