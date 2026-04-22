import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Video, Calendar, Clock, RefreshCw, Loader2, MapPin, X, ChevronRight, CheckCircle } from 'lucide-react'
import PatientPageLayout from '../../components/patient/PatientPageLayout'
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

const getStatusIcon = (status) => {
  switch (status) {
    case 'BOOKED':
      return <Calendar className="h-4 w-4 text-blue-600" />
    case 'CONFIRMED':
      return <CheckCircle className="h-4 w-4 text-violet-600" />
    case 'IN_PROGRESS':
      return <Clock className="h-4 w-4 text-amber-600" />
    case 'COMPLETED':
      return <CheckCircle className="h-4 w-4 text-emerald-600" />
    case 'CANCELLED':
      return <X className="h-4 w-4 text-rose-600" />
    default:
      return null
  }
}

  if (!patientId) {
    return (
      <PatientPageLayout title="My Appointments" subtitle="View your appointment history">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-amber-600" />
          </div>
          <p className="text-amber-900 font-medium">Patient session not found. Please log in again to see appointments.</p>
        </div>
      </PatientPageLayout>
    )
  }

  return (
    <PatientPageLayout 
      title="My Appointments" 
      subtitle="View and manage all your healthcare appointments"
    >
      <div className="space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm text-slate-600">
            Showing {appointments.length} {appointments.length === 1 ? 'appointment' : 'appointments'}. 
            Auto-refreshes every 15 seconds.
          </p>
          <button
            type="button"
            onClick={loadAppointments}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Messages */}
        {errorMessage && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-center gap-2">
            <div className="h-5 w-5 rounded-full bg-rose-200 flex items-center justify-center text-rose-700 font-bold text-xs">!</div>
            {errorMessage}
          </div>
        )}

        {roomMessage && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600" />
            {roomMessage}
          </div>
        )}

        {/* Appointments Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            <span className="ml-3 text-slate-600">Loading appointments...</span>
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No appointments yet</h3>
            <p className="text-sm text-slate-500 mb-4 max-w-sm mx-auto">
              You haven't booked any appointments yet. Start by booking your first consultation.
            </p>
            <button
              onClick={() => navigate('/patient/book')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Book Appointment
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {appointments.map((appointment) => {
              const canCancel = appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED'
              const isOnline = appointment.type === 'ONLINE_VIDEO'
              const canJoin = isOnline && appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED'

              return (
                <div 
                  key={appointment.id} 
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Card Header */}
                  <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        isOnline ? 'bg-blue-100' : 'bg-emerald-100'
                      }`}>
                        {isOnline ? (
                          <Video className={`h-5 w-5 ${isOnline ? 'text-blue-600' : 'text-emerald-600'}`} />
                        ) : (
                          <MapPin className="h-5 w-5 text-emerald-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{appointment.doctorName}</h3>
                        <p className="text-sm text-slate-500">{appointment.specialty || 'General Consultation'}</p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                        statusStyles[appointment.status] || 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="px-6 py-4">
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span>{new Date(appointment.appointmentDateTime).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span>{new Date(appointment.appointmentDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <span className="text-slate-400">Type:</span>
                        <span className={isOnline ? 'text-blue-600 font-medium' : 'text-emerald-600 font-medium'}>
                          {isOnline ? 'Online Video' : 'Physical Visit'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <span className="text-slate-400">Fee:</span>
                        <span className="font-medium text-slate-900">${appointment.fee}</span>
                      </div>
                    </div>

                    {appointment.notes && (
                      <p className="mt-4 text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
                        {appointment.notes}
                      </p>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-3">
                    {canJoin && (
                      <button
                        type="button"
                        onClick={() => handleJoinConsultation(appointment)}
                        disabled={joiningAppointmentId === appointment.id}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                      >
                        {joiningAppointmentId === appointment.id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Preparing...
                          </>
                        ) : (
                          <>
                            <Video className="h-4 w-4" />
                            Join Consultation
                          </>
                        )}
                      </button>
                    )}

                    {canCancel && (
                      <button
                        type="button"
                        onClick={() => handleCancel(appointment.id)}
                        className="inline-flex items-center gap-2 rounded-lg border border-rose-300 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 transition-colors"
                      >
                        <X className="h-4 w-4" />
                        Cancel Appointment
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </PatientPageLayout>
  )
}
