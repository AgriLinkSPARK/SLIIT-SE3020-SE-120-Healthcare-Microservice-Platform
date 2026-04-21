export default function DoctorCard({ name = 'Dr. Jane Doe', specialization = 'Cardiology' }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-bold text-slate-800">{name}</h3>
      <p className="text-sm text-slate-600">{specialization}</p>
    </article>
  )
}
