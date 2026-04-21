import { Calendar, FileText, Search, Pill, Upload } from 'lucide-react'

const iconMap = {
  calendar: Calendar,
  file: FileText,
  search: Search,
  pill: Pill,
  upload: Upload,
}

export default function EmptyState({ icon = 'file', title, description, actionText, onAction }) {
  const Icon = iconMap[icon] || FileText

  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-sm mb-4">{description}</p>}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  )
}
