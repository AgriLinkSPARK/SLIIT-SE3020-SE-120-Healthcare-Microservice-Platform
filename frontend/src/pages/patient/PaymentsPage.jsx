import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CreditCard, Clock, AlertCircle, Loader2, CheckCircle } from 'lucide-react'
import PatientPageLayout from '../../components/patient/PatientPageLayout'
import PaymentForm from '../../components/PaymentForm'
import PaymentHistory from '../../components/PaymentHistory'
import useAuth from '../../hooks/useAuth'

const resolvePatientId = (user) => {
  const candidates = [
    user?.userId,
    user?.patientId,
    user?.user?.userId,
    user?.user?.patientId,
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
      <PatientPageLayout title="Payments" subtitle="Manage your payments and billing">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-amber-600" />
          </div>
          <p className="text-amber-900 font-medium">Patient session not found. Please log in again to load payment data.</p>
        </div>
      </PatientPageLayout>
    )
  }

  return (
    <PatientPageLayout title="Payments" subtitle="Manage your payments and view billing history">
      <div className="space-y-6">
        {/* Payment Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-white">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Make a Payment</h2>
                <p className="text-sm text-slate-500">Complete payment for your consultation</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-6 grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Consultation ID</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    value={consultationId}
                    onChange={(event) => setConsultationId(event.target.value)}
                    placeholder="Enter consultation ID"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Doctor (Name or ID)</label>
                <input
                  value={doctorId}
                  onChange={(event) => setDoctorId(event.target.value)}
                  placeholder="Enter doctor name or ID"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Schedule Fee (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                  <input
                    type="number"
                    min="1"
                    value={amount}
                    readOnly
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm"
                  />
                </div>
              </div>
            </div>

            {!isFormValid && (
              <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
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
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Payment History</h2>
                <p className="text-sm text-slate-500">View your past transactions</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <PaymentHistory key={refreshKey} patientId={patientId} />
          </div>
        </div>
      </div>
    </PatientPageLayout>
  )
}
