import { Stethoscope, Star } from 'lucide-react'

export default function DoctorCard({ doctor, onViewProfile, onBookAppointment }) {
  const displayName = `Dr. ${doctor.firstName || ''} ${doctor.lastName || ''}`.trim()

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center flex-shrink-0">
          <Stethoscope className="h-7 w-7 text-brand-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800 truncate">{displayName}</h3>
          <p className="text-sm text-brand-500 font-medium">{doctor.specialization || 'General Physician'}</p>
          {doctor.experience && (
            <p className="text-xs text-slate-500 mt-1">{doctor.experience} years experience</p>
          )}
          {doctor.rating && (
            <div className="flex items-center gap-1 mt-1">
              <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              <span className="text-xs text-slate-600">{doctor.rating}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        {onViewProfile && (
          <button
            onClick={() => onViewProfile(doctor.id)}
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            View Profile
          </button>
        )}
        {onBookAppointment && (
          <button
            onClick={() => onBookAppointment(doctor)}
            className="flex-1 rounded-lg bg-brand-500 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-600 transition-colors"
          >
            Book Appointment
          </button>
        )}
      </div>
    </div>
  )
}
