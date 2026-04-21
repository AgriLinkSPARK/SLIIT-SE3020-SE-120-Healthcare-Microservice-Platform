export default function AvailabilityForm() {
  return (
    <form className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-bold text-slate-800">Set Availability</h3>
      <input className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Date / Time" />
      <button type="button" className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white">
        Save
      </button>
    </form>
  )
}
