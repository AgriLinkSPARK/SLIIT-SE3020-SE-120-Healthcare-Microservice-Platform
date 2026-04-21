import { useState, useCallback } from 'react'
import { Upload, X, FileText } from 'lucide-react'

export default function FileUploadDropzone({ onFileSelect, maxSizeMB = 10 }) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [error, setError] = useState('')

  const maxSizeBytes = maxSizeMB * 1024 * 1024

  const handleFile = useCallback(
    (file) => {
      setError('')
      if (!file) return

      if (file.size > maxSizeBytes) {
        setError(`File size exceeds ${maxSizeMB}MB limit`)
        return
      }

      setSelectedFile(file)
      onFileSelect(file)
    },
    [maxSizeBytes, maxSizeMB, onFileSelect]
  )

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      setDragActive(false)
      if (e.dataTransfer.files?.[0]) {
        handleFile(e.dataTransfer.files[0])
      }
    },
    [handleFile]
  )

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = () => setDragActive(false)

  const handleClear = () => {
    setSelectedFile(null)
    setError('')
    onFileSelect(null)
  }

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
          dragActive
            ? 'border-brand-500 bg-brand-50'
            : 'border-slate-300 bg-slate-50 hover:border-slate-400'
        }`}
      >
        <Upload className="mx-auto h-8 w-8 text-slate-400 mb-3" />
        <p className="text-sm text-slate-600 mb-1">
          Drag & drop your file here, or{' '}
          <label className="text-brand-500 font-medium cursor-pointer hover:text-brand-600">
            browse
            <input
              type="file"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
          </label>
        </p>
        <p className="text-xs text-slate-400">
          PDF, JPG, PNG, DOC up to {maxSizeMB}MB
        </p>
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      )}

      {selectedFile && (
        <div className="mt-3 flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
          <FileText className="h-5 w-5 text-brand-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-700 truncate">{selectedFile.name}</p>
            <p className="text-xs text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
          </div>
          <button
            onClick={handleClear}
            className="p-1 rounded hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4 text-slate-400" />
          </button>
        </div>
      )}
    </div>
  )
}
