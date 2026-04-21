import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Activity,
  AlertCircle,
  Calendar,
  ChevronRight,
  Coffee,
  FilePlus,
  FileText,
  Heart,
  Lightbulb,
  Pill,
  Plus,
  Sparkles,
  Stethoscope,
  Upload,
  User,
  Wallet,
  X,
  Phone,
  Droplets,
  Zap,
} from 'lucide-react'
import useAuth from '../../hooks/useAuth'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/patient/EmptyState'
import AppointmentStatusBadge from '../../components/patient/AppointmentStatusBadge'
import PatientInfoCard from '../../components/patient/PatientInfoCard'
import PatientSidebar, { MobileHeader } from '../../components/patient/PatientSidebar'
import PatientHeader from '../../components/patient/PatientHeader'
import {
  getPatientProfile,
  getUpcomingAppointments,
  getMedicalReports,
  getPatientPrescriptions,
} from '../../services/patientService'

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

  return candidates.find((item) => typeof item === 'string' && item.trim()) || ''
}

const resolveDisplayName = (user) => {
  const candidates = [
    user?.fullName,
    user?.name,
    user?.firstName,
    user?.user?.fullName,
    user?.user?.name,
    user?.data?.fullName,
    user?.data?.name,
  ]

  return candidates.find((item) => typeof item === 'string' && item.trim()) || 'there'
}

const formatAppointmentDate = (appointment) => {
  if (appointment?.appointmentDateTime) {
    return new Date(appointment.appointmentDateTime).toLocaleString()
  }

  if (appointment?.appointmentDate && appointment?.appointmentTime) {
    const date = new Date(appointment.appointmentDate)
    return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${appointment.appointmentTime}`
  }

  if (appointment?.appointmentDate) {
    return new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return 'Date not set'
}

const healthTips = [
  { icon: Droplets, text: 'Drink at least 8 glasses of water today' },
  { icon: Heart, text: 'Take a 10-minute walk after lunch' },
  { icon: Coffee, text: 'Limit caffeine after 2 PM for better sleep' },
  { icon: Zap, text: 'Stand up and stretch every hour' },
  { icon: Activity, text: 'Practice deep breathing for 5 minutes' },
]

function QuickActionCard({ icon: Icon, title, description, onClick, color, isDarkMode }) {
  const colorClasses = {
    blue: 'from-sky-500 to-blue-600 shadow-sky-500/30',
    green: 'from-emerald-500 to-teal-600 shadow-emerald-500/30',
    purple: 'from-violet-500 to-purple-600 shadow-violet-500/30',
    orange: 'from-amber-500 to-orange-600 shadow-amber-500/30',
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300 hover:scale-[1.03] hover:shadow-xl ${
        isDarkMode
          ? 'border-slate-700 bg-slate-800 hover:bg-slate-700'
          : 'border-slate-100 bg-white shadow-lg shadow-slate-200/30 hover:border-slate-200'
      }`}
    >
      <div className={`absolute left-0 right-0 top-0 h-1 bg-gradient-to-r ${colorClasses[color]}`} />
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${colorClasses[color]} shadow-lg transition-transform group-hover:scale-110`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 pt-1">
          <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{title}</h4>
          <p className={`mt-1 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{description}</p>
        </div>
      </div>
    </button>
  )
}

function WelcomeBanner({ patient, isDarkMode }) {
  const hour = new Date().getHours()
  let greeting = 'Good morning'
  if (hour >= 12) greeting = 'Good afternoon'
  if (hour >= 17) greeting = 'Good evening'

  const firstName = patient?.firstName || patient?.name?.split(' ')[0] || 'there'

  const services = [
    { icon: Activity, label: 'Health Check' },
    { icon: Pill, label: 'Medications' },
    { icon: FileText, label: 'Lab Reports' },
    { icon: Calendar, label: 'Appointments' },
  ]

  return (
    <div className="relative mb-8 h-64 overflow-hidden rounded-3xl md:h-80 bg-gradient-to-r from-slate-950 via-blue-950 to-sky-800">
      <div className="absolute inset-0 opacity-60" style={{
        backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.18) 0, rgba(255,255,255,0) 28%), radial-gradient(circle at 80% 30%, rgba(125,211,252,0.25) 0, rgba(125,211,252,0) 22%), radial-gradient(circle at 50% 100%, rgba(59,130,246,0.22) 0, rgba(59,130,246,0) 32%)',
      }} />
      <div className={`absolute inset-0 ${isDarkMode ? 'bg-slate-900/55' : 'bg-gradient-to-r from-blue-950/70 via-blue-900/40 to-transparent'}`} />
      <div className="relative z-10 flex h-full flex-col justify-center p-6 md:p-10">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-wider text-blue-200">{greeting}</p>
          <h1 className="mt-2 text-3xl font-bold text-white md:text-5xl">Welcome back, {firstName}!</h1>
          <p className="mt-3 max-w-lg text-base text-blue-100/90 md:text-lg">
            Your health is our priority. Access your medical records, book appointments, and manage your healthcare journey all in one place.
          </p>

          <div className="mt-6 flex flex-wrap gap-4">
            {services.map((service) => (
              <div key={service.label} className="flex flex-col items-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/30 bg-white/20 backdrop-blur-sm transition-colors hover:bg-white/30 md:h-14 md:w-14">
                  <service.icon className="h-5 w-5 text-white md:h-6 md:w-6" />
                </div>
                <span className="text-xs font-medium text-white/90">{service.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function HealthTipCard({ isDarkMode }) {
  const [tipIndex, setTipIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((previous) => (previous + 1) % healthTips.length)
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const currentTip = healthTips[tipIndex]
  const Icon = currentTip.icon

  return (
    <div
      className={`rounded-2xl border p-5 ${
        isDarkMode
          ? 'border-amber-800/50 bg-gradient-to-br from-amber-900/30 to-orange-900/30'
          : 'border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isDarkMode ? 'bg-amber-500/20' : 'bg-amber-100'}`}>
          <Lightbulb className={`h-5 w-5 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
        </div>
        <div className="flex-1">
          <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>
            Daily Wellness Tip
          </p>
          <p className={`mt-1 text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            <Icon className="mb-0.5 mr-1 inline h-4 w-4" />
            {currentTip.text}
          </p>
        </div>
      </div>
    </div>
  )
}

function EmergencyButton({ isDarkMode }) {
  return (
    <button
      type="button"
      className={`w-full rounded-2xl border-2 border-dashed p-4 transition-all duration-300 hover:scale-[1.02] ${
        isDarkMode ? 'border-rose-800 bg-rose-900/20 hover:bg-rose-900/30' : 'border-rose-300 bg-rose-50 hover:bg-rose-100'
      }`}
    >
      <div className="flex items-center justify-center gap-2">
        <Phone className={`h-5 w-5 ${isDarkMode ? 'text-rose-400' : 'text-rose-600'}`} />
        <span className={`font-semibold ${isDarkMode ? 'text-rose-400' : 'text-rose-700'}`}>Emergency Contact</span>
      </div>
      <p className={`mt-1 text-center text-xs ${isDarkMode ? 'text-rose-300/70' : 'text-rose-600/70'}`}>
        Tap for immediate assistance
      </p>
    </button>
  )
}

function SectionHeader({ title, actionText, onAction, icon: Icon, isDarkMode }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-brand-50'}`}>
            <Icon className={`h-5 w-5 ${isDarkMode ? 'text-brand-400' : 'text-brand-500'}`} />
          </div>
        )}
        <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{title}</h2>
      </div>

      {actionText && (
        <button type="button" onClick={onAction} className="flex items-center gap-1 text-sm font-medium text-brand-500 transition-colors hover:text-brand-600">
          {actionText}
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export default function PatientDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [patient, setPatient] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [reports, setReports] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [hasError, setHasError] = useState(false)

  const isDarkMode = false
  const patientId = useMemo(() => resolvePatientId(user), [user])
  const displayName = useMemo(() => resolveDisplayName(user), [user])

  useEffect(() => {
    const handleError = (event) => {
      console.error('Dashboard error:', event.error)
      setHasError(true)
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!patientId) {
        setError('User not authenticated')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')

        const [profileData, appointmentsData, reportsData, prescriptionsData] = await Promise.all([
          getPatientProfile(patientId),
          getUpcomingAppointments(patientId).catch(() => []),
          getMedicalReports(patientId).catch(() => []),
          getPatientPrescriptions(patientId).catch(() => []),
        ])

        setPatient(profileData)
        setAppointments(Array.isArray(appointmentsData) ? appointmentsData : [])
        setReports(Array.isArray(reportsData) ? reportsData : [])
        setPrescriptions(Array.isArray(prescriptionsData) ? prescriptionsData : [])
      } catch (err) {
        setError('Failed to load dashboard data. Please try again.')
        console.error('Dashboard error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [patientId])

  const sortedAppointments = useMemo(() => {
    return [...appointments].sort((left, right) => {
      const leftTime = left.appointmentDateTime || left.appointmentDate ? new Date(left.appointmentDateTime || left.appointmentDate).getTime() : Number.MAX_SAFE_INTEGER
      const rightTime = right.appointmentDateTime || right.appointmentDate ? new Date(right.appointmentDateTime || right.appointmentDate).getTime() : Number.MAX_SAFE_INTEGER
      return leftTime - rightTime
    })
  }, [appointments])

  const upcomingAppointments = sortedAppointments.slice(0, 3)
  const recentReports = reports.slice(0, 3)
  const recentPrescriptions = prescriptions.slice(0, 2)

  if (hasError) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className={`mx-4 w-full max-w-md rounded-3xl p-8 text-center shadow-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
          <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-red-100'}`}>
            <AlertCircle className={`h-10 w-10 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />
          </div>
          <h2 className={`mb-2 text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Something went wrong</h2>
          <p className={`mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            The dashboard encountered an error. Please try refreshing the page.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full rounded-xl bg-brand-500 px-6 py-3 font-semibold text-white shadow-lg shadow-brand-500/30 transition-colors hover:bg-brand-600"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  if (!patientId && !loading) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className={`mx-4 w-full max-w-md rounded-3xl p-8 text-center shadow-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
          <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-red-100'}`}>
            <AlertCircle className={`h-10 w-10 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />
          </div>
          <h2 className={`mb-2 text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Session Expired</h2>
          <p className={`mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Please log in again to access your dashboard.
          </p>
          <button
            type="button"
            onClick={() => navigate('/auth/login')}
            className="w-full rounded-xl bg-brand-500 px-6 py-3 font-semibold text-white shadow-lg shadow-brand-500/30 transition-colors hover:bg-brand-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className="flex flex-col items-center gap-4">
          <Loader />
          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <MobileHeader onMenuClick={() => setIsMobileMenuOpen(true)} isDarkMode={isDarkMode} user={user} />

      <PatientSidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
        isDarkMode={isDarkMode}
      />

      <PatientHeader isDarkMode={isDarkMode} isCollapsed={isSidebarCollapsed} />

      <main className={`min-h-screen pt-16 transition-all duration-300 ${isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <div className="p-4 sm:p-6 lg:p-8">
          <WelcomeBanner patient={patient || user} isDarkMode={isDarkMode} />

          <div className="mb-8 flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">Patient Dashboard</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Welcome back, {displayName}. Manage your appointments, reports, prescriptions, and payments from one place.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate('/patient/doctors')}
                className="inline-flex items-center rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                Book Doctor Appointment
              </button>
              <button
                type="button"
                onClick={() => navigate('/patient/appointments')}
                className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                View My Appointments
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
              <button type="button" onClick={() => setError('')} className="ml-auto rounded p-1 hover:bg-black/10">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="mb-8">
            <SectionHeader title="Quick Actions" icon={Sparkles} isDarkMode={isDarkMode} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <QuickActionCard
                icon={Plus}
                title="Book Appointment"
                description="Schedule with a doctor"
                onClick={() => navigate('/patient/doctors')}
                color="blue"
                isDarkMode={isDarkMode}
              />
              <QuickActionCard
                icon={Upload}
                title="Upload Report"
                description="Add medical documents"
                onClick={() => navigate('/patient/reports')}
                color="green"
                isDarkMode={isDarkMode}
              />
              <QuickActionCard
                icon={User}
                title="Edit Profile"
                description="Update your information"
                onClick={() => navigate('/patient/profile')}
                color="purple"
                isDarkMode={isDarkMode}
              />
              <QuickActionCard
                icon={Wallet}
                title="View Payments"
                description="Check billing history"
                onClick={() => navigate('/patient/payments')}
                color="orange"
                isDarkMode={isDarkMode}
              />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <section>
                <SectionHeader title="Profile Summary" actionText="Edit Profile" onAction={() => navigate('/patient/profile')} icon={User} isDarkMode={isDarkMode} />
                <PatientInfoCard patient={patient || user} isDarkMode={isDarkMode} />
              </section>

              <section>
                <SectionHeader title="Upcoming Appointments" actionText="View All" onAction={() => navigate('/patient/appointments')} icon={Calendar} isDarkMode={isDarkMode} />
                <div className={`overflow-hidden rounded-2xl border ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white shadow-lg shadow-slate-200/50'}`}>
                  {upcomingAppointments.length === 0 ? (
                    <div className="p-8">
                      <EmptyState
                        icon="calendar"
                        title="No upcoming appointments"
                        description="Book an appointment with a doctor to get started"
                        actionText="Book Now"
                        onAction={() => navigate('/patient/doctors')}
                      />
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {upcomingAppointments.map((appointment) => (
                        <div key={appointment.id} className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-slate-50">
                          <div className="flex items-center gap-4">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${isDarkMode ? 'bg-brand-500/20' : 'bg-brand-100'}`}>
                              <Stethoscope className={`h-6 w-6 ${isDarkMode ? 'text-brand-400' : 'text-brand-500'}`} />
                            </div>
                            <div>
                              <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Dr. {appointment.doctorName || 'Unknown'}</p>
                              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{formatAppointmentDate(appointment)}</p>
                              {appointment.reason && <p className={`mt-1 text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{appointment.reason}</p>}
                            </div>
                          </div>
                          <AppointmentStatusBadge status={appointment.status} isDarkMode={isDarkMode} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <HealthTipCard isDarkMode={isDarkMode} />
              <EmergencyButton isDarkMode={isDarkMode} />

              <section>
                <SectionHeader title="Recent Reports" actionText="View All" onAction={() => navigate('/patient/reports')} icon={FileText} isDarkMode={isDarkMode} />
                <div className={`overflow-hidden rounded-2xl border ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white shadow-lg shadow-slate-200/50'}`}>
                  {recentReports.length === 0 ? (
                    <div className="p-8">
                      <EmptyState
                        icon="file"
                        title="No reports yet"
                        description="Upload your medical reports to keep them organized"
                        actionText="Upload"
                        onAction={() => navigate('/patient/reports')}
                      />
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {recentReports.map((report) => (
                        <div key={report.id} className="flex items-center gap-4 p-4 transition-colors hover:bg-slate-50">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${isDarkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                            <FilePlus className={`h-6 w-6 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={`truncate font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{report.title}</p>
                            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{report.description || 'No description'}</p>
                          </div>
                          <button type="button" className={`rounded-lg p-2 transition-colors ${isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'}`}>
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <section>
                <SectionHeader title="Recent Prescriptions" actionText="View All" onAction={() => navigate('/patient/prescriptions')} icon={Pill} isDarkMode={isDarkMode} />
                <div className={`overflow-hidden rounded-2xl border ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white shadow-lg shadow-slate-200/50'}`}>
                  {recentPrescriptions.length === 0 ? (
                    <div className="p-8">
                      <EmptyState
                        icon="pill"
                        title="No prescriptions yet"
                        description="Your prescriptions will appear here after your doctor visits"
                        actionText="Book Appointment"
                        onAction={() => navigate('/patient/doctors')}
                      />
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {recentPrescriptions.map((prescription) => (
                        <div key={prescription.id} className="p-4 transition-colors hover:bg-slate-50">
                          <div className="flex items-start gap-3">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${isDarkMode ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                              <Pill className={`h-6 w-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                            </div>
                            <div className="flex-1">
                              <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Dr. {prescription.doctorName || 'Unknown'}</p>
                              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{prescription.diagnosis || 'General consultation'}</p>
                              {Array.isArray(prescription.medications) && prescription.medications.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {prescription.medications.slice(0, 2).map((medication, index) => (
                                    <span key={`${medication.medicationName || medication.name || 'med'}-${index}`} className={`rounded-lg px-2 py-1 text-xs font-medium ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                                      {medication.medicationName || medication.name}
                                    </span>
                                  ))}
                                  {prescription.medications.length > 2 && (
                                    <span className={`rounded-lg px-2 py-1 text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                      +{prescription.medications.length - 2} more
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <section>
                <SectionHeader title="Health Summary" icon={Activity} isDarkMode={isDarkMode} />
                <div className={`rounded-2xl border p-6 ${isDarkMode ? 'border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900' : 'border-slate-200 bg-gradient-to-br from-brand-50 to-white shadow-lg shadow-slate-200/50'}`}>
                  <div className="mb-4 flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg shadow-brand-500/30">
                      <Heart className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Health Status: Good</h3>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Last checkup: 2 weeks ago</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className={`rounded-xl p-3 shadow-sm ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
                      <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>BMI</p>
                      <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>22.5</p>
                      <p className={`text-xs ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>Normal</p>
                    </div>
                    <div className={`rounded-xl p-3 shadow-sm ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
                      <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Blood Pressure</p>
                      <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>120/80</p>
                      <p className={`text-xs ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>Optimal</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
