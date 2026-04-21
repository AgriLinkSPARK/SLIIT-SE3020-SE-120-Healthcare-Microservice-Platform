import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Calendar,
  FileText,
  User,
  Clock,
  ChevronRight,
  Plus,
  Pill,
  Heart,
  Activity,
  Upload,
  ChevronLeft,
  Stethoscope,
  FilePlus,
  Wallet,
  Sparkles,
  AlertCircle,
  X,
  Menu,
  Phone,
  Lightbulb,
  Droplets,
  Zap,
  Coffee,
} from 'lucide-react'
import PatientInfoCard from '../../components/patient/PatientInfoCard'
import AppointmentStatusBadge from '../../components/patient/AppointmentStatusBadge'
import EmptyState from '../../components/patient/EmptyState'
import Loader from '../../components/common/Loader'
import PatientSidebar, { MobileHeader } from '../../components/patient/PatientSidebar'
import PatientHeader from '../../components/patient/PatientHeader'
import {
  getPatientProfile,
  getUpcomingAppointments,
  getMedicalReports,
  getPatientPrescriptions,
} from '../../services/patientService'
import { getCurrentUser } from '../../utils/tokenUtils'

// Health Tips Data
const healthTips = [
  { icon: Droplets, text: "Drink at least 8 glasses of water today" },
  { icon: Heart, text: "Take a 10-minute walk after lunch" },
  { icon: Coffee, text: "Limit caffeine after 2 PM for better sleep" },
  { icon: Zap, text: "Stand up and stretch every hour" },
  { icon: Activity, text: "Practice deep breathing for 5 minutes" },
]

// Quick Action Card - Redesigned with gradient accent
function QuickActionCard({ icon: Icon, title, description, onClick, color, isDarkMode }) {
  const colorClasses = {
    blue: 'from-sky-500 to-blue-600 shadow-sky-500/30',
    green: 'from-emerald-500 to-teal-600 shadow-emerald-500/30',
    purple: 'from-violet-500 to-purple-600 shadow-violet-500/30',
    orange: 'from-amber-500 to-orange-600 shadow-amber-500/30',
  }

  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl text-left ${
        isDarkMode
          ? 'bg-slate-800 border border-slate-700 hover:bg-slate-700'
          : 'bg-white border border-slate-100 hover:border-slate-200 shadow-lg shadow-slate-200/30'
      }`}
    >
      {/* Gradient top bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colorClasses[color]}`} />
      
      <div className="flex items-start gap-4">
        <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 pt-1">
          <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{title}</h4>
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{description}</p>
        </div>
      </div>
    </button>
  )
}

// Welcome Banner Component - Full background image banner
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
    <div className="relative overflow-hidden rounded-3xl mb-8 h-64 md:h-80">
      {/* Full background image */}
      <img
        src="/doctor-banner.jpg"
        alt="Healthcare Banner"
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => {
          // Fallback to gradient if image fails
          e.target.style.display = 'none'
        }}
      />
      {/* Dark overlay for text readability */}
      <div className={`absolute inset-0 ${
        isDarkMode
          ? 'bg-slate-900/70'
          : 'bg-gradient-to-r from-blue-900/80 via-blue-800/60 to-transparent'
      }`} />

      {/* Content overlay */}
      <div className="relative z-10 h-full flex flex-col justify-center p-6 md:p-10">
        <div className="max-w-2xl">
          <p className="text-blue-200 text-sm font-medium uppercase tracking-wider">{greeting}</p>
          <h1 className="text-white text-3xl md:text-5xl font-bold mt-2">
            Welcome back, {firstName}!
          </h1>
          <p className="text-blue-100/90 text-base md:text-lg mt-3 max-w-lg">
            Your health is our priority. Access your medical records, book appointments, and manage your healthcare journey all in one place.
          </p>

          {/* Service Icons */}
          <div className="flex flex-wrap gap-4 mt-6">
            {services.map((service, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2">
                <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer">
                  <service.icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                <span className="text-xs text-white/90 font-medium">{service.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Health Tip Card Component - Rotating wellness tips
function HealthTipCard({ isDarkMode }) {
  const [tipIndex, setTipIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % healthTips.length)
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const currentTip = healthTips[tipIndex]
  const Icon = currentTip.icon

  return (
    <div className={`rounded-2xl p-5 border ${
      isDarkMode
        ? 'bg-gradient-to-br from-amber-900/30 to-orange-900/30 border-amber-800/50'
        : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
          isDarkMode ? 'bg-amber-500/20' : 'bg-amber-100'
        }`}>
          <Lightbulb className={`h-5 w-5 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
        </div>
        <div className="flex-1">
          <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>
            Daily Wellness Tip
          </p>
          <p className={`text-sm mt-1 font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            <Icon className="inline h-4 w-4 mr-1 mb-0.5" />
            {currentTip.text}
          </p>
        </div>
      </div>
    </div>
  )
}

// Emergency Quick Access Button
function EmergencyButton({ isDarkMode }) {
  return (
    <button className={`w-full rounded-2xl p-4 border-2 border-dashed transition-all duration-300 hover:scale-[1.02] ${
      isDarkMode
        ? 'border-rose-800 bg-rose-900/20 hover:bg-rose-900/30'
        : 'border-rose-300 bg-rose-50 hover:bg-rose-100'
    }`}>
      <div className="flex items-center justify-center gap-2">
        <Phone className={`h-5 w-5 ${isDarkMode ? 'text-rose-400' : 'text-rose-600'}`} />
        <span className={`font-semibold ${isDarkMode ? 'text-rose-400' : 'text-rose-700'}`}>
          Emergency Contact
        </span>
      </div>
      <p className={`text-xs mt-1 text-center ${isDarkMode ? 'text-rose-300/70' : 'text-rose-600/70'}`}>
        Tap for immediate assistance
      </p>
    </button>
  )
}

// Section Header
function SectionHeader({ title, actionText, onAction, icon: Icon, isDarkMode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        {Icon && (
          <div
            className={`h-10 w-10 rounded-xl flex items-center justify-center ${
              isDarkMode ? 'bg-slate-800' : 'bg-brand-50'
            }`}
          >
            <Icon className={`h-5 w-5 ${isDarkMode ? 'text-brand-400' : 'text-brand-500'}`} />
          </div>
        )}
        <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{title}</h2>
      </div>
      {actionText && (
        <button
          onClick={onAction}
          className="text-sm font-medium text-brand-500 hover:text-brand-600 flex items-center gap-1 transition-colors"
        >
          {actionText}
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export default function PatientDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [patient, setPatient] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [reports, setReports] = useState([])
  const [prescriptions, setPrescriptions] = useState([])

  // UI States
  const isDarkMode = false // Dark mode disabled
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [hasError, setHasError] = useState(false)

  const currentUser = getCurrentUser()
  const patientId = currentUser?.id

  // Error boundary effect
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
        setAppointments(appointmentsData || [])
        setReports(reportsData || [])
        setPrescriptions(prescriptionsData || [])
      } catch (err) {
        setError('Failed to load dashboard data. Please try again.')
        console.error('Dashboard error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [patientId])

  const formatDate = (dateStr, timeStr) => {
    if (!dateStr) return 'Date not set'
    const date = new Date(dateStr)
    const formatted = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    return timeStr ? `${formatted} at ${timeStr}` : formatted
  }

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode)

  // Handle errors
  if (hasError) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className={`max-w-md w-full mx-4 p-8 rounded-3xl shadow-2xl text-center ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
          <div className={`h-20 w-20 mx-auto mb-6 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-slate-700' : 'bg-red-100'}`}>
            <AlertCircle className={`h-10 w-10 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />
          </div>
          <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
            Something went wrong
          </h2>
          <p className={`mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            The dashboard encountered an error. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 px-6 rounded-xl bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/30"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  // Handle unauthenticated state
  if (!patientId && !loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className={`max-w-md w-full mx-4 p-8 rounded-3xl shadow-2xl text-center ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
          <div className={`h-20 w-20 mx-auto mb-6 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-slate-700' : 'bg-red-100'}`}>
            <AlertCircle className={`h-10 w-10 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />
          </div>
          <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
            Session Expired
          </h2>
          <p className={`mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Please log in again to access your dashboard
          </p>
          <button
            onClick={() => navigate('/auth/login')}
            className="w-full py-3 px-6 rounded-xl bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/30"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-100 border-t-brand-500" />
          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
      {/* Mobile Header */}
      <MobileHeader
        onMenuClick={() => setIsMobileMenuOpen(true)}
        isDarkMode={isDarkMode}
        user={currentUser}
      />

      {/* Sidebar */}
      <PatientSidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
        isDarkMode={isDarkMode}
      />

      {/* Top Header */}
      <PatientHeader
        isDarkMode={isDarkMode}
        isCollapsed={isSidebarCollapsed}
      />

      {/* Main Content */}
      <main
        className={`transition-all duration-300 pt-16 min-h-screen ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Welcome Banner */}
          <WelcomeBanner patient={patient} isDarkMode={isDarkMode} />

          {/* Error Alert */}
          {error && (
            <div className={`mb-6 rounded-2xl border p-4 flex items-center gap-3 ${
              isDarkMode ? 'border-red-800 bg-red-900/30 text-red-300' : 'border-red-200 bg-red-50 text-red-700'
            }`}>
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
              <button
                onClick={() => setError('')}
                className="ml-auto p-1 hover:bg-black/10 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mb-8">
            <SectionHeader
              title="Quick Actions"
              icon={Sparkles}
              isDarkMode={isDarkMode}
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

          {/* Main Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Summary */}
              <section>
                <SectionHeader
                  title="Profile Summary"
                  actionText="Edit Profile"
                  onAction={() => navigate('/patient/profile')}
                  icon={User}
                  isDarkMode={isDarkMode}
                />
                <PatientInfoCard patient={patient} isDarkMode={isDarkMode} />
              </section>

              {/* Upcoming Appointments */}
              <section>
                <SectionHeader
                  title="Upcoming Appointments"
                  actionText="View All"
                  onAction={() => navigate('/patient/appointments')}
                  icon={Calendar}
                  isDarkMode={isDarkMode}
                />
                <div className={`rounded-2xl border overflow-hidden ${
                  isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-lg shadow-slate-200/50'
                }`}>
                  {appointments.length === 0 ? (
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
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                      {appointments.slice(0, 3).map((apt) => (
                        <div
                          key={apt.id}
                          className={`flex items-center justify-between p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
                            isDarkMode ? '' : ''
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                              isDarkMode ? 'bg-brand-500/20' : 'bg-brand-100'
                            }`}>
                              <Stethoscope className={`h-6 w-6 ${isDarkMode ? 'text-brand-400' : 'text-brand-500'}`} />
                            </div>
                            <div>
                              <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                Dr. {apt.doctorName || 'Unknown'}
                              </p>
                              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                {formatDate(apt.appointmentDate, apt.appointmentTime)}
                              </p>
                              {apt.reason && (
                                <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                  {apt.reason}
                                </p>
                              )}
                            </div>
                          </div>
                          <AppointmentStatusBadge status={apt.status} isDarkMode={isDarkMode} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Daily Wellness Tip */}
              <HealthTipCard isDarkMode={isDarkMode} />

              {/* Emergency Quick Access */}
              <EmergencyButton isDarkMode={isDarkMode} />

              {/* Recent Reports */}
              <section>
                <SectionHeader
                  title="Recent Reports"
                  actionText="View All"
                  onAction={() => navigate('/patient/reports')}
                  icon={FileText}
                  isDarkMode={isDarkMode}
                />
                <div className={`rounded-2xl border overflow-hidden ${
                  isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-lg shadow-slate-200/50'
                }`}>
                  {reports.length === 0 ? (
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
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                      {reports.slice(0, 3).map((report) => (
                        <div
                          key={report.id}
                          className="flex items-center gap-4 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
                        >
                          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                            isDarkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'
                          }`}>
                            <FilePlus className={`h-6 w-6 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={`font-semibold truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                              {report.title}
                            </p>
                            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                              {report.description || 'No description'}
                            </p>
                          </div>
                          <button
                            className={`p-2 rounded-lg transition-colors ${
                              isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                            }`}
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* Prescriptions Preview */}
              <section>
                <SectionHeader
                  title="Recent Prescriptions"
                  actionText="View All"
                  onAction={() => navigate('/patient/prescriptions')}
                  icon={Pill}
                  isDarkMode={isDarkMode}
                />
                <div className={`rounded-2xl border overflow-hidden ${
                  isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-lg shadow-slate-200/50'
                }`}>
                  {prescriptions.length === 0 ? (
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
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                      {prescriptions.slice(0, 2).map((prescription) => (
                        <div
                          key={prescription.id}
                          className="p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                              isDarkMode ? 'bg-purple-500/20' : 'bg-purple-100'
                            }`}>
                              <Pill className={`h-6 w-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                            </div>
                            <div className="flex-1">
                              <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                Dr. {prescription.doctorName || 'Unknown'}
                              </p>
                              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                {prescription.diagnosis || 'General consultation'}
                              </p>
                              {prescription.medications && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {prescription.medications.slice(0, 2).map((med, idx) => (
                                    <span
                                      key={idx}
                                      className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                        isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                                      }`}
                                    >
                                      {med.medicationName}
                                    </span>
                                  ))}
                                  {prescription.medications.length > 2 && (
                                    <span className={`px-2 py-1 rounded-lg text-xs ${
                                      isDarkMode ? 'text-slate-500' : 'text-slate-400'
                                    }`}>
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

              {/* Health Summary Card */}
              <section>
                <SectionHeader
                  title="Health Summary"
                  icon={Activity}
                  isDarkMode={isDarkMode}
                />
                <div className={`rounded-2xl border p-6 ${
                  isDarkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700' : 'bg-gradient-to-br from-brand-50 to-white border-slate-200 shadow-lg shadow-slate-200/50'
                }`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
                      <Heart className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        Health Status: Good
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Last checkup: 2 weeks ago
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
                      <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>BMI</p>
                      <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>22.5</p>
                      <p className={`text-xs ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>Normal</p>
                    </div>
                    <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
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

