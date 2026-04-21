import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import useAuth from '../../hooks/useAuth'
import { cancelAppointment, getAppointmentsByPatient } from '../../services/appointmentService'

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

const statusStyles = {
  BOOKED: 'bg-blue-50 text-blue-700 border-blue-200',
  CONFIRMED: 'bg-violet-50 text-violet-700 border-violet-200',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
}

export default function MyAppointments() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const patientId = useMemo(() => resolvePatientId(user), [user])
  const [appointments, setAppointments] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const loadAppointments = useCallback(async () => {
    if (!patientId) {
      return
    }

    try {
      const data = await getAppointmentsByPatient(patientId)
      setAppointments(Array.isArray(data) ? data : [])
      setErrorMessage('')
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }, [patientId])

  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

  useEffect(() => {
    const intervalId = setInterval(() => {
      loadAppointments()
    }, 15000)

    return () => clearInterval(intervalId)
  }, [loadAppointments])

  const handleCancel = async (appointmentId) => {
    try {
      await cancelAppointment(appointmentId)
      await loadAppointments()
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to cancel appointment')
    }
  }

  if (!patientId) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
          Patient session not found. Please log in again to see appointments.
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      {/* Back Button */}
      <button
        onClick={() => navigate('/patient/dashboard')}
        className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Dashboard
      </button>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Appointments</h1>
        <button
          type="button"
          onClick={loadAppointments}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      <p className="text-sm text-slate-600">Status updates are refreshed every 15 seconds.</p>

      {errorMessage && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {errorMessage}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">Loading appointments...</div>
      ) : appointments.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">No appointments found.</div>
      ) : (
        <div className="grid gap-3">
          {appointments.map((appointment) => {
            const canCancel = appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED'
            return (
              <div key={appointment.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold text-slate-800">{appointment.doctorName}</h2>
                  <span
                    className={`rounded-full border px-2 py-1 text-xs font-semibold ${statusStyles[appointment.status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}
                  >
                    {appointment.status}
                  </span>
                </div>

                <div className="mt-3 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
                  <div><strong>Specialty:</strong> {appointment.specialty}</div>
                  <div><strong>Type:</strong> {appointment.type === 'ONLINE_VIDEO' ? 'Online Video' : 'Physical Visit'}</div>
                  <div><strong>Date & Time:</strong> {new Date(appointment.appointmentDateTime).toLocaleString()}</div>
                  <div><strong>Fee:</strong> ${appointment.fee}</div>
                </div>

                {appointment.notes && (
                  <p className="mt-2 text-sm text-slate-600">{appointment.notes}</p>
                )}

                {canCancel && (
                  <button
                    type="button"
                    onClick={() => handleCancel(appointment.id)}
                    className="mt-3 rounded-lg border border-rose-300 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
                  >
                    Cancel Appointment
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
