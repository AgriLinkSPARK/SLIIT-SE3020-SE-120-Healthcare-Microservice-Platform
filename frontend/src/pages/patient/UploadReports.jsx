import { useState, useRef, useCallback, useEffect } from 'react'
import {
  Upload,
  FileText,
  X,
  Download,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileImage,
  File,
  Calendar,
  Clock
} from 'lucide-react'
import PatientPageLayout from '../../components/patient/PatientPageLayout'
import useAuth from '../../hooks/useAuth'
import { 
  getPatientByUserId, 
  getMedicalReports, 
  uploadMedicalReport, 
  deleteMedicalReport,
  downloadReport 
} from '../../services/patientService'

const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const getFileIcon = (fileType) => {
  if (fileType?.startsWith('image/')) return FileImage
  return FileText
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default function UploadReports() {
  const { user } = useAuth()
  const fileInputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [patientId, setPatientId] = useState(null)

  // Load patient and reports on mount
  useEffect(() => {
    const init = async () => {
      if (user?.userId) {
        try {
          const patient = await getPatientByUserId(user.userId)
          setPatientId(patient.id)
          const reports = await getMedicalReports(patient.id)
          
          // Map backend reports to frontend structure
          const mappedReports = reports.map(r => ({
            id: r.id,
            name: r.title || r.fileName,
            fileName: r.fileName,
            type: r.fileType || 'application/pdf',
            size: r.fileSize || 0,
            uploadDate: r.uploadedAt || new Date().toISOString(),
          }))
          
          setUploadedFiles(mappedReports)
        } catch (error) {
          console.error('Failed to load reports:', error)
          setErrorMessage('Failed to load your medical reports.')
        }
      }
    }
    init()
  }, [user])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const validateFile = (file) => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return 'Invalid file type. Only PDF, JPG, and PNG files are allowed.'
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size exceeds 10MB limit.'
    }
    return null
  }

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return

    const file = files[0]
    const validationError = validateFile(file)

    if (validationError) {
      setErrorMessage(validationError)
      setTimeout(() => setErrorMessage(''), 5000)
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', file.name)
      formData.append('description', 'Uploaded via patient dashboard')

      const response = await uploadMedicalReport(patientId || user.userId, formData, (progress) => {
        setUploadProgress(progress)
      })

      // Add new file to list
      const newFile = {
        id: response.id,
        name: response.title || response.fileName,
        fileName: response.fileName,
        type: response.fileType || file.type,
        size: response.fileSize || file.size,
        uploadDate: response.uploadedAt || new Date().toISOString(),
      }

      setUploadedFiles((prev) => [newFile, ...prev])
      setSuccessMessage(`"${file.name}" uploaded successfully!`)

      // Reset after showing success
      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
      }, 500)
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to upload file. Please try again.')
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileUpload(e.dataTransfer.files)
  }, [])

  const handleFileInputChange = (e) => {
    handleFileUpload(e.target.files)
    e.target.value = '' // Reset input
  }

  const handleDeleteFile = async (fileId) => {
    try {
      await deleteMedicalReport(patientId || user.userId, fileId)
      setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId))
      setSuccessMessage('File deleted successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      setErrorMessage('Failed to delete file. Please try again.')
    }
  }

  const handleDownloadFile = (file) => {
    if (file.fileName) {
      downloadReport(file.fileName)
    } else {
      setSuccessMessage('Searching for file...')
      setTimeout(() => setSuccessMessage(''), 3000)
    }
  }

  return (
    <PatientPageLayout
      title="Upload Medical Reports"
      subtitle="Upload and manage your medical documents"
    >
      <div className="space-y-6">
        {/* Success Message */}
        {successMessage && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3 animate-fade-in">
            <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <p className="text-sm font-medium text-emerald-800">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
            <p className="text-sm font-medium text-rose-800">{errorMessage}</p>
          </div>
        )}

        {/* Upload Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Upload New Report</h2>
                <p className="text-sm text-slate-500">Drag and drop or click to select file</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileInputChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
              />

              {isUploading ? (
                <div className="space-y-3">
                  <Loader2 className="h-10 w-10 text-blue-600 animate-spin mx-auto" />
                  <p className="text-sm font-medium text-slate-700">Uploading...</p>
                  <div className="max-w-xs mx-auto">
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{uploadProgress}%</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <FileImage className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-base font-medium text-slate-700 mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-slate-500">
                    PDF, JPG, or PNG (max 10MB)
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Uploaded Files List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Uploaded Reports</h2>
                  <p className="text-sm text-slate-500">
                    {uploadedFiles.length} {uploadedFiles.length === 1 ? 'file' : 'files'} in your library
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {uploadedFiles.length === 0 ? (
              <div className="p-12 text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <File className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-base font-medium text-slate-900 mb-1">No reports yet</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Upload your medical reports to keep them organized and easily accessible
                </p>
              </div>
            ) : (
              uploadedFiles.map((file) => {
                const FileIcon = getFileIcon(file.type)
                const uploadDate = new Date(file.uploadDate)

                return (
                  <div
                    key={file.id}
                    className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
                  >
                    {/* File Icon */}
                    <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <FileIcon className="h-6 w-6 text-blue-600" />
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {file.name}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {uploadDate.toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {uploadDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span>{formatFileSize(file.size)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownloadFile(file)}
                        className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Download"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-amber-900 mb-1">Important Note</h3>
              <p className="text-sm text-amber-700">
                Your uploaded reports are securely stored and only accessible to you and your authorized healthcare providers. 
                Supported formats: PDF, JPG, PNG (max 10MB per file).
              </p>
            </div>
          </div>
        </div>
      </div>
    </PatientPageLayout>
  )
}
