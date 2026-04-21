import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import PaymentForm from '../../components/PaymentForm'
import PaymentHistory from '../../components/PaymentHistory'
import useAuth from '../../hooks/useAuth'

const resolvePatientId = (user) => {
  const candidates = [
    user?.id,
    user?._id,
    user?.userId,
    user?.patientId,
    user?.user?.id,
    user?.user?._id,
    user?.user?.userId,
    user?.user?.patientId,
    localStorage.getItem('userId'),
  ]

  const value = candidates.find((item) => typeof item === 'string' && item.trim())
  return value || ''
}

export default function PaymentsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [consultationId, setConsultationId] = useState('')
  const [doctorId, setDoctorId] = useState('')
  const [amount, setAmount] = useState('50')
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
      setAmount(amountFromQuery)
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
      {/* Back to Dashboard Button */}
      <button
        onClick={() => navigate('/patient/dashboard')}
        className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors mb-2"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Dashboard
      </button>

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
            <span className="text-sm font-medium text-slate-700">Amount (USD)</span>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
        </div>

        {!isFormValid && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Enter consultation ID, doctor name/ID, and a valid amount to enable payment submission.
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
