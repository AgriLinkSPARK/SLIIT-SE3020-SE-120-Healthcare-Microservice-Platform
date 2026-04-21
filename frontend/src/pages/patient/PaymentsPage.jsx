import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PaymentForm from '../../components/PaymentForm'
import PaymentHistory from '../../components/PaymentHistory'
import useAuth from '../../hooks/useAuth'

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

  const value = candidates.find((item) => typeof item === 'string' && item.trim())
  return value || ''
}

export default function PaymentsPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [consultationId, setConsultationId] = useState('')
  const [doctorId, setDoctorId] = useState('')
  const [amount, setAmount] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const patientId = useMemo(() => resolvePatientId(user), [user])

  const isFormValid = useMemo(() => {
    const parsedAmount = Number(amount)
    return Boolean(patientId && consultationId.trim() && doctorId.trim() && parsedAmount > 0)
  }, [amount, consultationId, doctorId, patientId])

  useEffect(() => {
    const consultationFromQuery = searchParams.get('consultationId')
    const doctorFromQuery = searchParams.get('doctorId')
    const amountFromQuery = searchParams.get('amount')

    if (consultationFromQuery) {
      setConsultationId(consultationFromQuery)
    }
    if (doctorFromQuery) {
      setDoctorId(doctorFromQuery)
    }
    if (amountFromQuery && Number(amountFromQuery) > 0) {
      setAmount(Number(amountFromQuery).toFixed(2))
    }
  }, [searchParams])

  if (!patientId) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
          Patient session not found. Please log in again to load payment data.
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Payments</h1>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700">Consultation ID</span>
            <input
              value={consultationId}
              onChange={(event) => setConsultationId(event.target.value)}
              placeholder="Enter consultation ID"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700">Doctor (Name or ID)</span>
            <input
              value={doctorId}
              onChange={(event) => setDoctorId(event.target.value)}
              placeholder="Enter doctor name or ID"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700">Schedule Fee (USD)</span>
            <input
              type="number"
              min="1"
              value={amount}
              readOnly
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
        </div>

        {!isFormValid && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Enter consultation ID and doctor details to enable payment submission. The fee is loaded from the selected schedule.
          </div>
        )}

        <PaymentForm
          consultationId={consultationId}
          patientId={patientId}
          doctorId={doctorId}
          amount={Number(amount) || 0}
          disabled={!isFormValid}
          onSuccess={() => setRefreshKey((value) => value + 1)}
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <PaymentHistory key={refreshKey} patientId={patientId} />
      </div>
    </div>
  )
}
