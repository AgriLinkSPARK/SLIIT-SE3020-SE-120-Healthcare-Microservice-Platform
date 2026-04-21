import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { cancelAppointment, getAppointmentsByPatient } from '../../services/appointmentService'
import { getVideoSessionByAppointmentId } from '../../services/telemedicineService'

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

const resolveDisplayName = (user) => {
  const candidates = [user?.fullName, user?.name, user?.firstName, user?.user?.fullName, user?.user?.name]
  return candidates.find((item) => typeof item === 'string' && item.trim()) || ''
}

const resolveEmail = (user) => {
  const candidates = [user?.email, user?.user?.email]
  return candidates.find((item) => typeof item === 'string' && item.trim()) || ''
}

const statusStyles = {
  BOOKED: 'bg-blue-50 text-blue-700 border-blue-200',
  CONFIRMED: 'bg-violet-50 text-violet-700 border-violet-200',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
}

export default function MyAppointments() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const patientId = useMemo(() => resolvePatientId(user), [user])
  const [appointments, setAppointments] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [roomMessage, setRoomMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [joiningAppointmentId, setJoiningAppointmentId] = useState('')

  const loadAppointments = useCallback(async () => {
    try {
      if (!patientId) {
        setAppointments([])
        setErrorMessage('Patient session not found. Please log in again to see appointments.')
        return
      }

      const data = await getAppointmentsByPatient(patientId)
      // Safety filter: only show appointments belonging to this patient
      const filtered = Array.isArray(data)
        ? data.filter((a) => a.patientId === patientId)
        : []

      setAppointments(filtered)
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

  const handleJoinConsultation = async (appointment) => {
    try {
      setJoiningAppointmentId(appointment.id)
      setErrorMessage('')
      setRoomMessage('')

      const session = await getVideoSessionByAppointmentId(appointment.id)

      navigate(`/telemedicine/sessions/${session.sessionId}`, {
        state: {
          session,
          appointment,
        },
      })
    } catch (error) {
      if (error.response?.status === 404) {
        setRoomMessage('Your consultation room is not ready yet. Please try again after your doctor starts the session.')
      } else {
        setErrorMessage(error.response?.data?.message || 'Failed to open the video consultation')
      }
    } finally {
      setJoiningAppointmentId('')
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

      <p className="text-sm text-slate-600">Showing only your booked appointments. Status updates are refreshed every 15 seconds.</p>

      {errorMessage && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {errorMessage}
        </div>
      )}

      {roomMessage && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {roomMessage}
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
                  <div><strong>Patient:</strong> {appointment.patientId}</div>
                  <div><strong>Doctor:</strong> {appointment.doctorName}</div>
                  <div><strong>Specialty:</strong> {appointment.specialty}</div>
                  <div><strong>Type:</strong> {appointment.type === 'ONLINE_VIDEO' ? 'Online Video' : 'Physical Visit'}</div>
                  <div><strong>Date & Time:</strong> {new Date(appointment.appointmentDateTime).toLocaleString()}</div>
                  <div><strong>Fee:</strong> ${appointment.fee}</div>
                </div>

                {appointment.type === 'ONLINE_VIDEO' && appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED' && (
                  <button
                    type="button"
                    onClick={() => handleJoinConsultation(appointment)}
                    disabled={joiningAppointmentId === appointment.id}
                    className="mt-3 mr-3 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {joiningAppointmentId === appointment.id ? 'Preparing room...' : 'Join Consultation'}
                  </button>
                )}

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
