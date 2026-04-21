import { useCallback, useEffect, useState } from 'react'
import DoctorPageLayout from '../../components/doctor/DoctorPageLayout'
import { getAppointmentsByDoctor, updateAppointmentStatus } from '../../services/appointmentService'
import useAuth from '../../hooks/useAuth'

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

export default function AppointmentsPage() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [updatingAppointmentId, setUpdatingAppointmentId] = useState('')

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

  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

  const updateDecision = useCallback(async (appointment, nextStatus) => {
    const appointmentId = appointment?.id || appointment?._id || ''

    if (!appointmentId) {
      setErrorMessage('Unable to update appointment status: appointment id is missing.')
      return
    }

    setUpdatingAppointmentId(appointmentId)
    setErrorMessage('')

    try {
      const updatedAppointment = await updateAppointmentStatus(appointmentId, nextStatus)

      setAppointments((previousAppointments) =>
        previousAppointments.map((item) => {
          const itemId = item?.id || item?._id || ''
          return itemId === appointmentId
            ? {
                ...item,
                ...(updatedAppointment || {}),
                status: updatedAppointment?.status || nextStatus,
              }
            : item
        })
      )
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to update appointment status.')
    } finally {
      setUpdatingAppointmentId('')
    }
  }, [])

  return (
    <DoctorPageLayout activeLabel="Appointments" title="Appointments">
      <div className="rounded-xl border border-[#e8ecf4] bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-lg font-semibold text-[#1b2435]">My Appointments</p>
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
                  <th className="px-3 py-2 text-left font-medium text-slate-600">Patient Name</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">Appointment Type</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">Date & Time</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((appointment) => (
                  <tr key={appointment.id || appointment._id}>
                    <td className="px-3 py-2 text-slate-700">
                      {appointment.patientName || appointment.patientFullName || appointment.patientId || '-'}
                    </td>
                    <td className="px-3 py-2 text-slate-700">{appointment.type}</td>
                    <td className="px-3 py-2 text-slate-700">
                      {appointment.appointmentDateTime ? new Date(appointment.appointmentDateTime).toLocaleString() : '-'}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {appointment.status === 'CONFIRMED' ? (
                        <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                          Approved
                        </span>
                      ) : appointment.status === 'CANCELLED' ? (
                        <span className="inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                          Rejected
                        </span>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                            {appointment.status || 'BOOKED'}
                          </span>

                          <button
                            type="button"
                            onClick={() => updateDecision(appointment, 'CONFIRMED')}
                            disabled={updatingAppointmentId === (appointment.id || appointment._id)}
                            className="rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Accept
                          </button>

                          <button
                            type="button"
                            onClick={() => updateDecision(appointment, 'CANCELLED')}
                            disabled={updatingAppointmentId === (appointment.id || appointment._id)}
                            className="rounded-md border border-rose-300 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Decline
                          </button>
                        </div>
                      )}
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
