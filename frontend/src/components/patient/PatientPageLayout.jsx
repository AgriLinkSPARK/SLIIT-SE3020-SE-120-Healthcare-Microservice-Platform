import {
  LayoutDashboard,
  CalendarPlus,
  CalendarDays,
  CreditCard,
  FileUp,
  UserCircle,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Stethoscope
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import useAuth from '../../hooks/useAuth'

export default function PatientPageLayout({ children, title, subtitle }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const patientName = user?.fullName || user?.name || user?.firstName || 'Patient'
  const patientEmail = user?.email || user?.user?.email || ''

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/patient/dashboard' },
    { icon: CalendarPlus, label: 'Book Appointment', path: '/patient/book' },
    { icon: CalendarDays, label: 'My Appointments', path: '/patient/appointments' },
    { icon: CreditCard, label: 'Payments', path: '/patient/payments' },
    { icon: FileUp, label: 'Upload Reports', path: '/patient/upload-reports' },
    { icon: UserCircle, label: 'Edit Profile', path: '/patient/profile' },
  ]

  const isActivePath = (path) => {
    if (path === '/patient/dashboard') {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  const handleLogout = () => {
    logout()
    navigate('/auth/login')
  }

  const handleNavClick = (path) => {
    navigate(path)
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-800">HealthCare</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div className="flex min-h-screen">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-slate-200 fixed h-full">
          {/* Logo */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">HealthCare</h1>
                <p className="text-xs text-slate-500">Patient Portal</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = isActivePath(item.path)
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                </button>
              )
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="p-4 border-t border-slate-100">
            <div className="px-4 py-3 mb-3">
              <p className="text-sm font-medium text-slate-800 truncate">{patientName}</p>
              <p className="text-xs text-slate-500 truncate">{patientEmail}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <Stethoscope className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg font-bold text-slate-800">HealthCare</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="p-4 space-y-1">
                {navItems.map((item) => {
                  const isActive = isActivePath(item.path)
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavClick(item.path)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  )
                })}
              </nav>

              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100 bg-white">
                <div className="px-4 py-2 mb-2">
                  <p className="text-sm font-medium text-slate-800">{patientName}</p>
                  <p className="text-xs text-slate-500">{patientEmail}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 min-h-screen">
          {/* Page Header */}
          <header className="bg-white border-b border-slate-200 px-6 py-5">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
            </div>
          </header>

          {/* Page Content */}
          <div className="p-4 lg:p-6">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
