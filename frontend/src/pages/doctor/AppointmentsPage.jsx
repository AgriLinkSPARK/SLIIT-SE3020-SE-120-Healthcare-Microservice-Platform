import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DoctorPageLayout from '../../components/doctor/DoctorPageLayout'
import { getAppointmentsByDoctor } from '../../services/appointmentService'
import useAuth from '../../hooks/useAuth'
import { ensureVideoSessionForAppointment } from '../../services/telemedicineService'

const resolveDoctorId = (user) => {
  const candidates = [
    user?.userId,
    user?.id,
    user?._id,
    user?.doctorId,
    user?.user?.userId,
    user?.user?.id,
    user?.user?._id,
    user?.user?.doctorId,
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

export default function AppointmentsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [joiningAppointmentId, setJoiningAppointmentId] = useState('')

  const doctorId = resolveDoctorId(user)

  const loadAppointments = useCallback(async () => {
    setLoading(true)
    setErrorMessage('')

    try {
      if (!doctorId) {
        setAppointments([])
        setErrorMessage('Doctor session not found. Please log in again.')
        return
      }

      const data = await getAppointmentsByDoctor(doctorId)
      setAppointments(Array.isArray(data) ? data : [])
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to load your appointments from MongoDB')
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }, [doctorId])

  const handleStartConsultation = async (appointment) => {
    try {
      setJoiningAppointmentId(appointment.id)
      setErrorMessage('')

      const session = await ensureVideoSessionForAppointment(appointment.id, {
        appointmentId: appointment.id,
        patientId: appointment.patientId || '',
        patientName: appointment.patientName || appointment.patientId || 'Patient',
        patientEmail: appointment.patientEmail || '',
        doctorId: doctorId || appointment.doctorId || '',
        doctorName: resolveDisplayName(user) || appointment.doctorName || 'Doctor',
        doctorEmail: resolveEmail(user),
        scheduledStartTime: appointment.appointmentDateTime,
        durationMinutes: Number(appointment.durationMinutes || 30),
        notes: appointment.notes || '',
      })

      navigate(`/telemedicine/sessions/${session.sessionId}`, {
        state: {
          session,
          appointment,
          userEmail: resolveEmail(user),
        },
      })
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to open the video consultation')
    } finally {
      setJoiningAppointmentId('')
    }
  }

  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

  return (
    <DoctorPageLayout activeLabel="Appointments" title="Appointments">
      <div className="rounded-xl border border-[#e8ecf4] bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-lg font-semibold text-[#1b2435]">My Appointments (MongoDB)</p>
          <button
            type="button"
            onClick={loadAppointments}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {errorMessage}
          </div>
        )}

        {loading ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">No appointments found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">Patient</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">Doctor</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">Specialty</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">Type</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">Date & Time</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">Status</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td className="px-3 py-2 text-slate-700">{appointment.patientId}</td>
                    <td className="px-3 py-2 text-slate-700">{appointment.doctorName}</td>
                    <td className="px-3 py-2 text-slate-700">{appointment.specialty}</td>
                    <td className="px-3 py-2 text-slate-700">{appointment.type}</td>
                    <td className="px-3 py-2 text-slate-700">
                      {appointment.appointmentDateTime ? new Date(appointment.appointmentDateTime).toLocaleString() : '-'}
                    </td>
                    <td className="px-3 py-2 text-slate-700">{appointment.status}</td>
                    <td className="px-3 py-2 text-slate-700">
                      <div className="flex flex-wrap gap-2">
                        {appointment.type === 'ONLINE_VIDEO' && appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED' ? (
                          <button
                            type="button"
                            onClick={() => handleStartConsultation(appointment)}
                            disabled={joiningAppointmentId === appointment.id}
                            className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {joiningAppointmentId === appointment.id ? 'Preparing room...' : 'Start Consultation'}
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">Consultation unavailable</span>
                        )}
                        <button
                          type="button"
                          onClick={() => navigate(`/doctor/prescriptions?patientId=${encodeURIComponent(appointment.patientId || '')}`)}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Prescribe
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DoctorPageLayout>
  )
}
