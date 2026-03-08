
import { useState, useEffect } from 'react'
import { FileText, Trash2, RefreshCw, AlertCircle } from 'lucide-react'
import DocumentUpload from '../components/DocumentUpload'
import { listDocuments, deleteDocument } from '../api/client'

export default function Documents() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deletingFile, setDeletingFile] = useState(null)

  const fetchDocuments = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await listDocuments()
      setDocuments(res.data.documents)
    } catch {
      setError('Failed to load documents')
    } finally {y
      setLoading(false)
    }
  }

  useEffect(() => { fetchDocuments() }, [])

  const handleDelete = async (filename) => {
    if (!confirm(`Delete "${filename}" from the knowledge base?`)) return
    setDeletingFile(filename)
    try {
      await deleteDocument(filename)
      setDocuments((prev) => prev.filter((d) => d.filename !== filename))
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete document')
    } finally {
      setDeletingFile(null)
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-gray-900">
        <div>
          <h2 className="text-white font-semibold">Document Management</h2>
          <p className="text-gray-400 text-xs">Upload and manage your SOP documents</p>
        </div>
        <button
          onClick={fetchDocuments}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Upload */}
        <div>
          <h3 className="text-white font-medium mb-3">Upload New Documents</h3>
          <DocumentUpload onUploadSuccess={fetchDocuments} />
        </div>

        {/* Document list */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-medium">Indexed Documents</h3>
            <span className="text-gray-400 text-sm">{documents.length} document{documents.length !== 1 ? 's' : ''}</span>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <RefreshCw size={20} className="text-blue-400 animate-spin" />
            </div>
          )}

          {error && !loading && (
            <div className="flex items-center gap-2 text-red-400 bg-red-400/10 rounded-lg px-4 py-3">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {!loading && !error && documents.length === 0 && (
            <div className="text-center py-8">
              <FileText size={32} className="mx-auto text-gray-600 mb-2" />
              <p className="text-gray-400 text-sm">No documents indexed yet. Upload your SOP files above.</p>
            </div>
          )}

          {!loading && documents.length > 0 && (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-4 bg-gray-800 rounded-lg px-4 py-3 border border-gray-700"
                >
                  <FileText size={20} className="text-blue-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{doc.filename}</p>
                    <p className="text-gray-400 text-xs">
                      {doc.chunks_created} chunks · {doc.status} · {new Date(doc.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full flex-shrink-0">
                    {doc.status}
                  </span>
                  <button
                    onClick={() => handleDelete(doc.filename)}
                    disabled={deletingFile === doc.filename}
                    className="text-gray-500 hover:text-red-400 transition-colors disabled:opacity-40 flex-shrink-0"
                  >
                    {deletingFile === doc.filename
                      ? <RefreshCw size={16} className="animate-spin" />
                      : <Trash2 size={16} />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}