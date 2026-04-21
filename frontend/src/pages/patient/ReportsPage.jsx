import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, Upload } from 'lucide-react'
import ReportCard from '../../components/patient/ReportCard'
import FileUploadDropzone from '../../components/patient/FileUploadDropzone'
import ConfirmationModal from '../../components/patient/ConfirmationModal'
import EmptyState from '../../components/patient/EmptyState'
import Loader from '../../components/common/Loader'
import { getMedicalReports, uploadMedicalReport, deleteMedicalReport } from '../../services/patientService'
import { getPatientServiceApiBaseUrl } from '../../utils/constants'
import { getCurrentUser } from '../../utils/tokenUtils'

const resolvePatientId = (user) => {
	const candidates = [
		user?.patientId,
		user?.userId,
		user?.id,
		user?._id,
		user?.data?.patientId,
		user?.data?.userId,
		user?.data?.id,
		user?.data?._id,
		user?.user?.patientId,
		user?.user?.userId,
		user?.user?.id,
		user?.user?._id,
		localStorage.getItem('patientId'),
		localStorage.getItem('userId'),
	]

	return candidates.find((item) => typeof item === 'string' && item.trim()) || ''
}

export default function ReportsPage() {
	const navigate = useNavigate()
	const [reports, setReports] = useState([])
	const [loading, setLoading] = useState(true)
	const [uploading, setUploading] = useState(false)
	const [error, setError] = useState('')
	const [selectedFile, setSelectedFile] = useState(null)
	const [deleteModal, setDeleteModal] = useState({ isOpen: false, reportId: null })
	const [reportTitle, setReportTitle] = useState('')
	const [reportDescription, setReportDescription] = useState('')

	const currentUser = getCurrentUser()
	const patientId = resolvePatientId(currentUser)

	const fetchReports = async () => {
		if (!patientId) return

		try {
			setLoading(true)
			setError('')
			const data = await getMedicalReports(patientId)
			setReports(data || [])
		} catch (err) {
			setError('Failed to load reports. Please try again.')
			console.error('Reports error:', err)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchReports()
	}, [patientId])

	const handleFileSelect = (file) => {
		setSelectedFile(file)
		if (!reportTitle && file) {
			setReportTitle(file.name.split('.')[0])
		}
	}

	const handleUpload = async () => {
		if (!selectedFile || !reportTitle.trim()) {
			setError('Please select a file and enter a title')
			return
		}

		try {
			setUploading(true)
			setError('')

			const formData = new FormData()
			formData.append('file', selectedFile)
			formData.append('title', reportTitle)
			formData.append('description', reportDescription)

			await uploadMedicalReport(patientId, formData)

			setSelectedFile(null)
			setReportTitle('')
			setReportDescription('')
			await fetchReports()
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to upload report. Please try again.')
		} finally {
			setUploading(false)
		}
	}

	const handleDownload = (fileUrl) => {
		if (fileUrl) {
			const fileName = fileUrl.split('/').pop()
			const downloadUrl = `${getPatientServiceApiBaseUrl()}/patients/reports/download/${fileName}`
			window.open(downloadUrl, '_blank')
		}
	}

	const handleDeleteClick = (reportId) => {
		setDeleteModal({ isOpen: true, reportId })
	}

	const handleConfirmDelete = async () => {
		if (!deleteModal.reportId) return

		try {
			await deleteMedicalReport(patientId, deleteModal.reportId)
			setReports((prev) => prev.filter((r) => r.id !== deleteModal.reportId))
			setDeleteModal({ isOpen: false, reportId: null })
		} catch (err) {
			setError('Failed to delete report. Please try again.')
		}
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-slate-50 p-4 sm:p-6">
				<Loader />
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-slate-50 p-4 sm:p-6">
			<div className="mx-auto max-w-5xl">
				<button
					onClick={() => navigate('/patient/dashboard')}
					className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-800"
				>
					<ArrowLeft className="h-4 w-4" />
					Back to Dashboard
				</button>

				<h1 className="mb-6 text-2xl font-semibold text-slate-800">Medical Reports</h1>

				{error && (
					<div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
						{error}
					</div>
				)}

				<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
					<h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
						<Upload className="h-5 w-5 text-brand-500" />
						Upload New Report
					</h2>

					<FileUploadDropzone onFileSelect={handleFileSelect} maxSizeMB={5} />

					{selectedFile && (
						<div className="mt-4 space-y-4">
							<div>
								<label className="mb-2 block text-sm font-medium text-slate-700">
									Report Title *
								</label>
								<input
									type="text"
									value={reportTitle}
									onChange={(e) => setReportTitle(e.target.value)}
									className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm w-full focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
									placeholder="Enter report title"
								/>
							</div>

							<div>
								<label className="mb-2 block text-sm font-medium text-slate-700">
									Description (optional)
								</label>
								<textarea
									value={reportDescription}
									onChange={(e) => setReportDescription(e.target.value)}
									rows={2}
									className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm w-full focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
									placeholder="Enter report description"
								/>
							</div>

							<div className="flex justify-end">
								<button
									onClick={handleUpload}
									disabled={uploading}
									className="flex items-center gap-2 rounded-full bg-brand-500 px-6 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
								>
									{uploading ? 'Uploading...' : 'Upload Report'}
								</button>
							</div>
						</div>
					)}
				</div>

				<div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
					<h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
						<FileText className="h-5 w-5 text-brand-500" />
						My Reports ({reports.length})
					</h2>

					{reports.length === 0 ? (
						<EmptyState
							icon="file"
							title="No reports yet"
							description="Upload your medical reports to keep them organized and accessible"
						/>
					) : (
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{reports.map((report) => (
								<ReportCard
									key={report.id}
									report={report}
									onDownload={handleDownload}
									onDelete={handleDeleteClick}
								/>
							))}
						</div>
					)}
				</div>

				<ConfirmationModal
					isOpen={deleteModal.isOpen}
					onClose={() => setDeleteModal({ isOpen: false, reportId: null })}
					onConfirm={handleConfirmDelete}
					title="Delete Report"
					message="Are you sure you want to delete this report? This action cannot be undone."
					confirmText="Delete"
					confirmVariant="danger"
				/>
			</div>
		</div>
	)
}
