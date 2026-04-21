const statusConfig = {
  SCHEDULED: { label: 'Scheduled', bg: 'bg-blue-100 text-blue-700', darkBg: 'bg-blue-500/20 text-blue-400' },
  CONFIRMED: { label: 'Confirmed', bg: 'bg-violet-100 text-violet-700', darkBg: 'bg-violet-500/20 text-violet-400' },
  BOOKED: { label: 'Booked', bg: 'bg-blue-100 text-blue-700', darkBg: 'bg-blue-500/20 text-blue-400' },
  IN_PROGRESS: { label: 'In Progress', bg: 'bg-amber-100 text-amber-700', darkBg: 'bg-amber-500/20 text-amber-400' },
  COMPLETED: { label: 'Completed', bg: 'bg-emerald-100 text-emerald-700', darkBg: 'bg-emerald-500/20 text-emerald-400' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-rose-100 text-rose-700', darkBg: 'bg-rose-500/20 text-rose-400' },
  PENDING: { label: 'Pending', bg: 'bg-yellow-100 text-yellow-700', darkBg: 'bg-yellow-500/20 text-yellow-400' },
}

export default function AppointmentStatusBadge({ status, isDarkMode }) {
  const config = statusConfig[status] || {
    label: status || 'Unknown',
    bg: 'bg-slate-100 text-slate-600',
    darkBg: 'bg-slate-500/20 text-slate-400',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        isDarkMode ? config.darkBg : config.bg
      }`}
    >
      {config.label}
    </span>
  )
}
