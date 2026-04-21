export default function AppointmentCard({ title = 'Consultation', time = '10:00 AM' }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-bold text-slate-800">{title}</h3>
      <p className="text-sm text-slate-600">{time}</p>
    </article>
  )
}
