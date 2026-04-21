import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pill, ChevronLeft, Calendar, User, FileText } from 'lucide-react'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/patient/EmptyState'
import { getPatientPrescriptions } from '../../services/patientService'
import { getCurrentUser } from '../../utils/tokenUtils'

export default function PrescriptionsPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [prescriptions, setPrescriptions] = useState([])

  const currentUser = getCurrentUser()
  const patientId = currentUser?.id

  useEffect(() => {
    const fetchPrescriptions = async () => {
      if (!patientId) {
        setError('User not authenticated')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')
        const data = await getPatientPrescriptions(patientId)
        setPrescriptions(data || [])
      } catch (err) {
        setError('Failed to load prescriptions. Please try again.')
        console.error('Prescriptions error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPrescriptions()
  }, [patientId])

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
        <Loader />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-4xl">
        <button
          onClick={() => navigate('/patient/dashboard')}
          className="mb-4 flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-brand-600"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-800">My Prescriptions</h1>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {prescriptions.length === 0 ? (
          <EmptyState
            icon="pill"
            title="No prescriptions yet"
            description="Your prescriptions will appear here after your doctor visits"
            actionText="Book Appointment"
            onAction={() => navigate('/patient/doctors')}
          />
        ) : (
          <div className="space-y-4">
            {prescriptions.map((prescription) => (
              <div
                key={prescription.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100">
                      <Pill className="h-6 w-6 text-brand-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        Prescription #{prescription.id?.slice(-6)}
                      </h3>
                      <p className="text-sm text-slate-500">
                        Prescribed on {formatDate(prescription.prescriptionDate)}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    Active
                  </div>
                </div>

                <div className="mb-4 grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <User className="h-4 w-4 text-slate-400" />
                    <span>Dr. {prescription.doctorName || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>Valid until {formatDate(prescription.validUntil)}</span>
                  </div>
                </div>

                {prescription.diagnosis && (
                  <div className="mb-4 rounded-lg bg-slate-50 p-3">
                    <p className="text-sm font-medium text-slate-700">Diagnosis:</p>
                    <p className="text-sm text-slate-600">{prescription.diagnosis}</p>
                  </div>
                )}

                {prescription.medications && prescription.medications.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-700">Medications:</p>
                    <div className="space-y-2">
                      {prescription.medications.map((med, index) => (
                        <div
                          key={index}
                          className="rounded-lg border border-slate-100 bg-slate-50 p-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-slate-800">
                              {med.medicationName}
                            </span>
                            <span className="text-xs text-slate-500">
                              {med.dosage}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            {med.frequency} for {med.duration}
                          </p>
                          {med.instructions && (
                            <p className="mt-1 text-xs text-slate-600">
                              <span className="font-medium">Instructions:</span> {med.instructions}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {prescription.notes && (
                  <div className="mt-4 flex items-start gap-2 rounded-lg bg-yellow-50 p-3">
                    <FileText className="mt-0.5 h-4 w-4 text-yellow-600" />
                    <p className="text-sm text-yellow-800">{prescription.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
