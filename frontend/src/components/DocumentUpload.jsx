import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, CheckCircle, XCircle, Loader } from 'lucide-react'
import { uploadDocument } from '../api/client'

export default function DocumentUpload({ onUploadSuccess }) {
  const [uploads, setUploads] = useState([])

  const updateUpload = (id, patch) =>
    setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)))

  const onDrop = useCallback(async (acceptedFiles) => {
    for (const file of acceptedFiles) {
      const id = Math.random().toString(36).slice(2)
      setUploads((prev) => [...prev, { id, name: file.name, status: 'uploading', progress: 0 }])
      try {
        const res = await uploadDocument(file, (progress) => updateUpload(id, { progress }))
        updateUpload(id, { status: 'done', chunks: res.data.chunks_created })
        onUploadSuccess?.()
      } catch (err) {
        updateUpload(id, {
          status: 'error',
          error: err.response?.data?.detail || 'Upload failed',
        })
      }
    }
  }, [onUploadSuccess])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
    },
    multiple: true,
  })

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/30'
        }`}
      >
        <input {...getInputProps()} />
        <Upload size={36} className="mx-auto mb-3 text-gray-400" />
        <p className="text-white font-medium mb-1">
          {isDragActive ? 'Drop files here...' : 'Drag & drop SOP documents'}
        </p>
        <p className="text-gray-400 text-sm">or click to browse — PDF and Word files supported</p>
      </div>

      {uploads.length > 0 && (
        <div className="space-y-2">
          {uploads.map((u) => (
            <div key={u.id} className="flex items-center gap-3 bg-gray-800 rounded-lg px-4 py-3">
              <FileText size={18} className="text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{u.name}</p>
                {u.status === 'uploading' && (
                  <div className="mt-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${u.progress}%` }}
                    />
                  </div>
                )}
                {u.status === 'done' && (
                  <p className="text-xs text-green-400">{u.chunks} chunks indexed</p>
                )}
                {u.status === 'error' && (
                  <p className="text-xs text-red-400">{u.error}</p>
                )}
              </div>
              <div className="flex-shrink-0">
                {u.status === 'uploading' && <Loader size={16} className="text-blue-400 animate-spin" />}
                {u.status === 'done' && <CheckCircle size={16} className="text-green-400" />}
                {u.status === 'error' && <XCircle size={16} className="text-red-400" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}