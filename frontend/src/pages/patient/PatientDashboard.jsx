import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { getAppointmentsByPatient } from '../../services/appointmentService'
import { getVideoSessionByAppointmentId } from '../../services/telemedicineService'

const resolvePatientId = (user) => {
  const candidates = [user?.userId, user?.patientId, user?.user?.userId, user?.user?.patientId]
  return candidates.find((item) => typeof item === 'string' && item.trim()) || ''
}

const resolveDisplayName = (user) => {
  const candidates = [user?.fullName, user?.name, user?.firstName, user?.user?.fullName, user?.user?.name]
  return candidates.find((item) => typeof item === 'string' && item.trim()) || 'Patient'
}

const resolveEmail = (user) => {
  const candidates = [user?.email, user?.user?.email]
  return candidates.find((item) => typeof item === 'string' && item.trim()) || ''
}

const formatDateTime = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleString()
}

const isJoinableVideoAppointment = (appointment) =>
  appointment?.type === 'ONLINE_VIDEO' && appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED'

export default function PatientDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const patientId = useMemo(() => resolvePatientId(user), [user])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [joiningAppointmentId, setJoiningAppointmentId] = useState('')
  const [roomMessage, setRoomMessage] = useState('')

  const loadAppointments = useCallback(async () => {
    try {
      if (!patientId) {
        setAppointments([])
        setErrorMessage('Patient session not found. Please log in again.')
        return
      }

      const data = await getAppointmentsByPatient(patientId)
      const filtered = Array.isArray(data) ? data.filter((appointment) => appointment.patientId === patientId) : []

      setAppointments(filtered)
      setErrorMessage('')
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to load your appointments')
    } finally {
      setLoading(false)
    }
  }, [patientId])

  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

  const nextVideoAppointment = useMemo(() => {
    const activeVideoAppointments = appointments
      .filter(isJoinableVideoAppointment)
      .sort((left, right) => {
        const leftTime = left.appointmentDateTime ? new Date(left.appointmentDateTime).getTime() : Number.MAX_SAFE_INTEGER
        const rightTime = right.appointmentDateTime ? new Date(right.appointmentDateTime).getTime() : Number.MAX_SAFE_INTEGER
        return leftTime - rightTime
      })

    return activeVideoAppointments[0] || null
  }, [appointments])

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
          userEmail: resolveEmail(user),
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
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
          Patient session not found. Please log in again.
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">Patient Dashboard</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Book a doctor appointment, then join your online consultation here like a secure Google Meet room.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/patient/book"
                className="inline-flex items-center rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Book Doctor Appointment
              </Link>
              <Link
                to="/appointments"
                className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                View My Appointments
              </Link>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </div>
        )}

        {roomMessage && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {roomMessage}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Next Online Consultation</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Your booked video appointments appear here. Open the meeting when it is time to see the doctor.
                </p>
              </div>
              <button
                type="button"
                onClick={loadAppointments}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Refresh
              </button>
            </div>

            <div className="mt-5">
              {loading ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                  Loading your appointments...
                </div>
              ) : nextVideoAppointment ? (
                <div className="rounded-3xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Online Video</p>
                      <h3 className="mt-2 text-2xl font-semibold text-slate-900">{nextVideoAppointment.doctorName}</h3>
                      <div className="mt-3 space-y-1 text-sm text-slate-700">
                        <p><strong>Specialty:</strong> {nextVideoAppointment.specialty || '-'}</p>
                        <p><strong>Date & Time:</strong> {formatDateTime(nextVideoAppointment.appointmentDateTime)}</p>
                        <p><strong>Status:</strong> {nextVideoAppointment.status}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleJoinConsultation(nextVideoAppointment)}
                      disabled={joiningAppointmentId === nextVideoAppointment.id}
                      className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {joiningAppointmentId === nextVideoAppointment.id ? 'Preparing room...' : 'Join Meeting'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
                  No upcoming online video consultation yet. Book an online appointment to see your meeting here.
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
              <div className="mt-4 grid gap-3">
                <Link
                  to="/patient/book"
                  className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Book a new appointment
                </Link>
                <Link
                  to="/patient/appointments"
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Open appointments list
                </Link>
                <Link
                  to="/patient/payments"
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Review payments
                </Link>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">How It Works</h2>
              <ol className="mt-4 space-y-3 text-sm text-slate-600">
                <li className="rounded-2xl bg-slate-50 p-4">1. Book an online appointment with a doctor.</li>
                <li className="rounded-2xl bg-slate-50 p-4">2. Return here when the appointment is ready.</li>
                <li className="rounded-2xl bg-slate-50 p-4">3. Click Join Meeting to open the secure video room.</li>
              </ol>
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}
