import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Calendar,
  FileText,
  User,
  Pill,
  Wallet,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Heart,
  X,
  Menu,
} from 'lucide-react'
import useAuth from '../../hooks/useAuth'
import { clearToken } from '../../utils/tokenUtils'

const navItems = [
  { path: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/patient/profile', label: 'My Profile', icon: User },
  { path: '/patient/doctors', label: 'Find Doctors', icon: Stethoscope },
  { path: '/patient/appointments', label: 'Appointments', icon: Calendar },
  { path: '/patient/reports', label: 'Medical Reports', icon: FileText },
  { path: '/patient/prescriptions', label: 'Prescriptions', icon: Pill },
  { path: '/patient/payments', label: 'Payments', icon: Wallet },
]

export function MobileHeader({ onMenuClick, isDarkMode, user }) {
  return (
    <div
      className={`lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 border-b ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      <button onClick={onMenuClick} className="p-2 rounded-lg hover:bg-slate-100">
        <Menu className={`h-5 w-5 ${isDarkMode ? 'text-white' : 'text-slate-700'}`} />
      </button>
      <div className="flex items-center gap-2">
        <Heart className="h-5 w-5 text-brand-500" />
        <span className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
          HealthCare
        </span>
      </div>
      <div className="w-10" />
    </div>
  )
}

export default function PatientSidebar({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  isDarkMode,
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    clearToken()
    navigate('/auth/login')
  }

  const handleNavClick = (path) => {
    navigate(path)
    setIsMobileOpen(false)
  }

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 flex flex-col ${
          isDarkMode
            ? 'bg-slate-900 border-r border-slate-800'
            : 'bg-white border-r border-slate-200 shadow-xl'
        } ${isCollapsed ? 'w-20' : 'w-64'} ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200/50">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-brand-500" />
              <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                HealthCare
              </span>
            </div>
          )}
          <button
            onClick={() => {
              if (isMobileOpen) {
                setIsMobileOpen(false)
              } else {
                setIsCollapsed(!isCollapsed)
              }
            }}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
            }`}
          >
            {isMobileOpen ? (
              <X className={`h-5 w-5 ${isDarkMode ? 'text-white' : 'text-slate-600'}`} />
            ) : isCollapsed ? (
              <ChevronRight className={`h-5 w-5 ${isDarkMode ? 'text-white' : 'text-slate-600'}`} />
            ) : (
              <ChevronLeft className={`h-5 w-5 ${isDarkMode ? 'text-white' : 'text-slate-600'}`} />
            )}
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
                  isCollapsed ? 'justify-center' : ''
                } ${
                  isActive
                    ? isDarkMode
                      ? 'bg-brand-500/20 text-brand-400'
                      : 'bg-brand-50 text-brand-600 shadow-sm'
                    : isDarkMode
                      ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-brand-500' : ''}`} />
                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-slate-200/50">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
              isCollapsed ? 'justify-center' : ''
            } ${
              isDarkMode
                ? 'text-slate-400 hover:bg-rose-500/20 hover:text-rose-400'
                : 'text-slate-600 hover:bg-rose-50 hover:text-rose-600'
            }`}
            title={isCollapsed ? 'Logout' : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
