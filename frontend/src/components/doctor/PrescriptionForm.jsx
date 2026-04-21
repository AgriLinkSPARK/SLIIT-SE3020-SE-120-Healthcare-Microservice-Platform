export default function PrescriptionForm({
  form,
  onChange,
  onSubmit,
  saving,
  consultations,
  patients = [],
  onPatientChange,
}) {
  const hasPatientOptions = Array.isArray(patients) && patients.length > 0

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm font-medium text-slate-700">
          <span>Prescription ID</span>
          <input
            value={form.prescriptionId}
            onChange={(event) => onChange('prescriptionId', event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="rx-..."
          />
        </label>

        <label className="space-y-1 text-sm font-medium text-slate-700">
          <span>Patient</span>
          {hasPatientOptions ? (
            <select
              value={form.patientId}
              onChange={(event) => {
                if (onPatientChange) {
                  onPatientChange(event.target.value)
                } else {
                  onChange('patientId', event.target.value)
                }
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
            >
              <option value="">Select patient with appointment</option>
              {patients.map((patient) => (
                <option key={patient.patientId} value={patient.patientId}>
                  {patient.patientName || patient.patientId} ({patient.patientId})
                </option>
              ))}
            </select>
          ) : (
            <input
              value={form.patientId}
              onChange={(event) => onChange('patientId', event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="Patient ID"
            />
          )}
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm font-medium text-slate-700">
          <span>Consultation ID</span>
          <input
            value={form.consultationId}
            onChange={(event) => onChange('consultationId', event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="Consultation or session ID"
          />
        </label>

        <label className="space-y-1 text-sm font-medium text-slate-700">
          <span>Diagnosis</span>
          <input
            value={form.diagnosis}
            onChange={(event) => onChange('diagnosis', event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="Diagnosis"
          />
        </label>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Use a saved consultation</div>
        <select
          value={form.consultationId}
          onChange={(event) => onChange('consultationId', event.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Pick from doctor consultations</option>
          {consultations.map((consultation) => (
            <option key={consultation.id || consultation.consultationId} value={consultation.consultationId || consultation.id}>
              {consultation.consultationId || consultation.id} {consultation.patientId ? `• ${consultation.patientId}` : ''}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs text-slate-500">You can type a consultation ID above or select a saved consultation here.</p>
      </div>

      <label className="block space-y-1 text-sm font-medium text-slate-700">
        <span>Medications</span>
        <textarea
          value={form.medications}
          onChange={(event) => onChange('medications', event.target.value)}
          className="min-h-32 w-full rounded-lg border border-slate-300 px-3 py-2"
          placeholder="One medication per line"
        />
      </label>

      <label className="block space-y-1 text-sm font-medium text-slate-700">
        <span>Additional notes</span>
        <textarea
          value={form.additionalNotes}
          onChange={(event) => onChange('additionalNotes', event.target.value)}
          className="min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2"
          placeholder="Follow-up advice or extra notes"
        />
      </label>

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
      >
        {saving ? 'Issuing...' : 'Issue Prescription'}
      </button>
    </form>
  )
}
