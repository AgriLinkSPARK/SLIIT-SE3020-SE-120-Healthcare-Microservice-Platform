import { User, Mail, Phone, Calendar, MapPin } from 'lucide-react'

export default function PatientInfoCard({ patient, isDarkMode }) {
  if (!patient) return null

  const infoFields = [
    { icon: User, label: 'Name', value: `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Not set' },
    { icon: Mail, label: 'Email', value: patient.email || 'Not set' },
    { icon: Phone, label: 'Phone', value: patient.phone || 'Not set' },
    { icon: Calendar, label: 'Date of Birth', value: patient.dateOfBirth || 'Not set' },
    { icon: MapPin, label: 'Address', value: patient.address || 'Not set' },
  ]

  return (
    <div
      className={`rounded-2xl border overflow-hidden ${
        isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-lg shadow-slate-200/50'
      }`}
    >
      <div className="p-5">
        <div className="flex items-center gap-4 mb-5">
          <div
            className={`h-16 w-16 rounded-2xl flex items-center justify-center text-xl font-bold ${
              isDarkMode
                ? 'bg-brand-500/20 text-brand-400'
                : 'bg-gradient-to-br from-brand-100 to-brand-200 text-brand-600'
            }`}
          >
            {(patient.firstName?.[0] || 'P').toUpperCase()}
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              {patient.firstName || ''} {patient.lastName || ''}
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {patient.gender || 'Gender not set'}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {infoFields.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <div
                className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isDarkMode ? 'bg-slate-700' : 'bg-slate-100'
                }`}
              >
                <Icon className={`h-4 w-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
              </div>
              <div className="min-w-0">
                <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{label}</p>
                <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
