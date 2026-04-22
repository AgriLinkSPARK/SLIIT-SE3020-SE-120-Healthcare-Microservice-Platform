import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarPlus,
  CalendarDays,
  CreditCard,
  FileUp,
  UserCircle,
  Video,
  Stethoscope,
  Clock,
  RefreshCw,
  ChevronRight,
  ArrowRight,
  Loader2
} from 'lucide-react'
import PatientPageLayout from '../../components/patient/PatientPageLayout'
import useAuth from '../../hooks/useAuth'
import { getAppointmentsByPatient } from '../../services/appointmentService'
import { getVideoSessionByAppointmentId } from '../../services/telemedicineService'

const resolvePatientId = (user) => {
  const candidates = [user?.userId, user?.patientId, user?.user?.userId, user?.user?.patientId]
  return candidates.find((item) => typeof item === 'string' && item.trim()) || ''
}

const resolveEmail = (user) => {
  const candidates = [user?.email, user?.user?.email]
  return candidates.find((item) => typeof item === 'string' && item.trim()) || ''
}

const formatDateTime = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const isJoinableVideoAppointment = (appointment) =>
  appointment?.type === 'ONLINE_VIDEO' && appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED'

const QuickActionCard = ({ icon: Icon, title, description, to, color = 'blue', onClick }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
    violet: 'bg-violet-50 text-violet-600 hover:bg-violet-100',
    amber: 'bg-amber-50 text-amber-600 hover:bg-amber-100',
    rose: 'bg-rose-50 text-rose-600 hover:bg-rose-100',
  }

  const handleClick = () => {
    if (onClick) onClick()
  }

  return (
    <button
      onClick={handleClick}
      className="w-full text-left group bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-blue-300 transition-all duration-200"
    >
      <div className="flex items-start gap-4">
        <div className={`h-12 w-12 rounded-xl ${colorClasses[color]} flex items-center justify-center transition-colors`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{title}</h3>
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        </div>
        <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
      </div>
    </button>
  )
}

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

  // Auto-refresh appointments every 15 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      loadAppointments()
    }, 15000)

    return () => clearInterval(intervalId)
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

  const quickActions = [
    {
      icon: CalendarPlus,
      title: 'Book Appointment',
      description: 'Schedule a new consultation with a doctor',
      color: 'blue',
      onClick: () => navigate('/patient/book'),
    },
    {
      icon: CalendarDays,
      title: 'My Appointments',
      description: 'View and manage your appointments',
      color: 'emerald',
      onClick: () => navigate('/patient/appointments'),
    },
    {
      icon: CreditCard,
      title: 'Payments',
      description: 'View payment history and pending bills',
      color: 'violet',
      onClick: () => navigate('/patient/payments'),
    },
    {
      icon: FileUp,
      title: 'Upload Reports',
      description: 'Upload and manage medical documents',
      color: 'amber',
      onClick: () => navigate('/patient/upload-reports'),
    },
    {
      icon: UserCircle,
      title: 'Edit Profile',
      description: 'Update your personal information',
      color: 'rose',
      onClick: () => navigate('/patient/profile'),
    },
  ]

  if (!patientId) {
    return (
      <PatientPageLayout title="Dashboard" subtitle="Welcome to your patient portal">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
            <Stethoscope className="h-5 w-5 text-amber-600" />
          </div>
          <p className="text-amber-900 font-medium">Patient session not found. Please log in again.</p>
        </div>
      </PatientPageLayout>
    )
  }

  return (
    <PatientPageLayout title="Dashboard" subtitle={`Welcome back, manage your healthcare journey`}>
      <div className="space-y-6">
        {/* Error & Info Messages */}
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

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content - Left 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Next Consultation Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Video className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Next Online Consultation</h2>
                    <p className="text-sm text-slate-500">Your upcoming video appointments</p>
                  </div>
                </div>
                <button
                  onClick={loadAppointments}
                  disabled={loading}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors disabled:opacity-50"
                  title="Refresh"
                >
                  <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                    <span className="ml-3 text-slate-600">Loading your appointments...</span>
                  </div>
                ) : nextVideoAppointment ? (
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg shadow-blue-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 rounded-full bg-white/20 text-xs font-medium backdrop-blur-sm">
                            Online Video
                          </span>
                          <span className="text-blue-100 text-sm">{nextVideoAppointment.status}</span>
                        </div>
                        <h3 className="text-2xl font-bold">{nextVideoAppointment.doctorName}</h3>
                        <p className="text-blue-100 mt-1">{nextVideoAppointment.specialty || 'General Consultation'}</p>
                        <div className="flex items-center gap-2 mt-3 text-sm">
                          <Clock className="h-4 w-4 text-blue-200" />
                          <span>{formatDateTime(nextVideoAppointment.appointmentDateTime)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleJoinConsultation(nextVideoAppointment)}
                        disabled={joiningAppointmentId === nextVideoAppointment.id}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-blue-600 font-semibold hover:bg-blue-50 disabled:opacity-70 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                      >
                        {joiningAppointmentId === nextVideoAppointment.id ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Preparing...
                          </>
                        ) : (
                          <>
                            <Video className="h-5 w-5" />
                            Join Meeting
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="mx-auto h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                      <Video className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-base font-medium text-slate-900 mb-1">No upcoming consultations</h3>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto mb-4">
                      Book an online appointment to see your meeting here
                    </p>
                    <button
                      onClick={() => navigate('/patient/book')}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      <CalendarPlus className="h-4 w-4" />
                      Book Appointment
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {quickActions.map((action) => (
                  <QuickActionCard key={action.title} {...action} />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Right column */}
          <div className="space-y-6">
            {/* How It Works */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-900">How It Works</h2>
              </div>
              <div className="p-6">
                <ol className="space-y-4">
                  {[
                    { step: 1, text: 'Book an online appointment with a doctor' },
                    { step: 2, text: 'Return here when the appointment is ready' },
                    { step: 3, text: 'Click Join Meeting to open the secure video room' },
                  ].map(({ step, text }) => (
                    <li key={step} className="flex items-start gap-4">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-blue-600">{step}</span>
                      </div>
                      <p className="text-sm text-slate-600 pt-1.5">{text}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Stats or Info Card */}
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg shadow-emerald-200 p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                  <CalendarDays className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-emerald-100 text-sm">Total Appointments</p>
                  <p className="text-2xl font-bold">{appointments.length}</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/patient/appointments')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium"
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Help Card */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-2">Need Help?</h3>
              <p className="text-sm text-slate-500 mb-4">
                If you have any questions about using the patient portal, our support team is here to help.
              </p>
              <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                Contact Support →
              </button>
            </div>
          </div>
        </div>
      </div>
    </PatientPageLayout>
  )
}
