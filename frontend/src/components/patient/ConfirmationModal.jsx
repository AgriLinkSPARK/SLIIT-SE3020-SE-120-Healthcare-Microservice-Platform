import { AlertTriangle, X } from 'lucide-react'

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure?',
  confirmText = 'Confirm',
  confirmVariant = 'primary',
}) {
  if (!isOpen) return null

  const buttonStyles = {
    primary: 'bg-brand-500 text-white hover:bg-brand-600',
    danger: 'bg-rose-500 text-white hover:bg-rose-600',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 animate-in fade-in zoom-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="h-5 w-5 text-slate-400" />
        </button>

        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-rose-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
            <p className="mt-1 text-sm text-slate-600">{message}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              buttonStyles[confirmVariant] || buttonStyles.primary
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
