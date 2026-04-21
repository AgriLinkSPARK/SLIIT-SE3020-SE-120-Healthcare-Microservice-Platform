import { FileText, Download, Trash2, Calendar } from 'lucide-react'

export default function ReportCard({ report, onDownload, onDelete }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <FileText className="h-6 w-6 text-emerald-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-800 truncate">{report.title || 'Untitled Report'}</h4>
          <p className="text-xs text-slate-500 mt-0.5 truncate">{report.description || 'No description'}</p>
          <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
            <Calendar className="h-3 w-3" />
            {formatDate(report.uploadedAt || report.createdAt)}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        {onDownload && report.fileUrl && (
          <button
            onClick={() => onDownload(report.fileUrl)}
            className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(report.id)}
            className="flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        )}
      </div>
    </div>
  )
}
