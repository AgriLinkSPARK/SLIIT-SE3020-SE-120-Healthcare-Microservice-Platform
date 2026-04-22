import { useState, useEffect } from 'react'
import { FileText, FileImage, File, Calendar, Download, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PatientPageLayout from '../../components/patient/PatientPageLayout'
import useAuth from '../../hooks/useAuth'
import { getPatientByUserId, getMedicalReports, downloadReport } from '../../services/patientService'

const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default function ReportsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [reports, setReports] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchReports = async () => {
      if (user?.userId) {
        try {
          const patient = await getPatientByUserId(user.userId)
          const data = await getMedicalReports(patient.id)
          setReports(data)
        } catch (error) {
          console.error('Failed to fetch reports:', error)
        } finally {
          setIsLoading(false)
        }
      }
    }
    fetchReports()
  }, [user])

  const handleDownload = (report) => {
    if (report.fileName) {
      downloadReport(report.fileName)
    }
  }

  const getFileIconComponent = (fileType) => {
    if (fileType?.startsWith('image/')) return FileImage
    return FileText
  }

  return (
    <PatientPageLayout
      title="Medical Reports"
      subtitle="View all your medical reports from doctors and labs"
    >
      <div className="space-y-6">
        {/* Info Banner */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900">Reports from Your Appointments</h3>
              <p className="text-sm text-blue-700 mt-1">
                These are reports uploaded by your doctors during appointments. To upload your own reports, 
                go to <button 
                  onClick={() => navigate('/patient/upload-reports')}
                  className="font-medium underline hover:text-blue-800"
                >Upload Reports</button>.
              </p>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {isLoading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-slate-500">Loading your reports...</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                No reports found.
              </div>
            ) : (
              reports.map((report) => {
                const FileIcon = getFileIconComponent(report.fileType)

                return (
                  <div
                    key={report.id}
                    className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
                  >
                    {/* File Icon */}
                    <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <FileIcon className="h-6 w-6 text-blue-600" />
                    </div>

                    {/* Report Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {report.title || report.fileName}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className={`px-2 py-0.5 rounded-full bg-blue-50 text-blue-700`}>
                          {report.fileType || 'Medical Report'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {report.uploadedAt ? new Date(report.uploadedAt).toLocaleDateString() : 'N/A'}
                        </span>
                        <span>{formatFileSize(report.fileSize)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownload(report)}
                        className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Download"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                      <button
                        className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="View"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Upload CTA */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <File className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-900">Have your own reports?</h3>
                <p className="text-sm text-amber-700 mt-1">
                  Upload your medical documents to keep everything in one place.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/patient/upload-reports')}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 text-white font-medium hover:bg-amber-700 transition-colors whitespace-nowrap"
            >
              Upload Reports
            </button>
          </div>
        </div>
      </div>
    </PatientPageLayout>
  )
}
