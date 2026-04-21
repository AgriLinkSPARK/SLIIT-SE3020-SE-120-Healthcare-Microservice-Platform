import { Bell } from 'lucide-react'

export default function PatientHeader({ isDarkMode, isCollapsed }) {
  return (
    <header
      className={`hidden lg:flex fixed top-0 right-0 z-30 items-center justify-end px-6 py-3 border-b transition-all duration-300 ${
        isCollapsed ? 'left-20' : 'left-64'
      } ${
        isDarkMode
          ? 'bg-slate-900/80 backdrop-blur-lg border-slate-800'
          : 'bg-white/80 backdrop-blur-lg border-slate-200'
      }`}
    >
      <div className="flex items-center gap-4">
        <button
          className={`relative p-2 rounded-xl transition-colors ${
            isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
          }`}
        >
          <Bell className={`h-5 w-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500" />
        </button>
      </div>
    </header>
  )
}
