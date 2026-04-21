import { useCallback, useEffect, useMemo, useState } from 'react'
import DoctorPageLayout from '../../components/doctor/DoctorPageLayout'
import useAuth from '../../hooks/useAuth'
import { getAppointmentsByDoctor } from '../../services/appointmentService'
import { getUsersByIds } from '../../services/authService'

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

export default function PatientsPage() {
  const { user } = useAuth()
  const doctorId = useMemo(() => resolveDoctorId(user), [user])
  const [appointments, setAppointments] = useState([])
  const [patientNames, setPatientNames] = useState({})
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const loadPatients = useCallback(async () => {
    setLoading(true)
    setErrorMessage('')

    try {
      if (!doctorId) {
        setAppointments([])
        setErrorMessage('Doctor session not found. Please log in again.')
        return
      }

      const data = await getAppointmentsByDoctor(doctorId)

      const appointmentsData = Array.isArray(data) ? data : []
      setAppointments(appointmentsData)

      const uniquePatientIds = [...new Set(appointmentsData.map((appointment) => appointment?.patientId).filter(Boolean))]
      const patients = await getUsersByIds(uniquePatientIds)
      const resolvedNames = (Array.isArray(patients) ? patients : []).reduce((accumulator, patient) => {
        if (patient?.userId) {
          accumulator[patient.userId] = patient.fullName || patient.email || patient.userId
        }
        return accumulator
      }, {})

      setPatientNames(resolvedNames)
    } catch (error) {
      setAppointments([])
      setPatientNames({})
      setErrorMessage(error.response?.data?.message || 'Failed to load booked patients')
    } finally {
      setLoading(false)
    }
  }, [doctorId])

  useEffect(() => {
    loadPatients()
  }, [loadPatients])

  const bookedPatients = useMemo(() => {
    const grouped = new Map()

    appointments.forEach((appointment) => {
      if (!appointment?.patientId) {
        return
      }

      const existing = grouped.get(appointment.patientId)
      const currentAppointmentTime = appointment.appointmentDateTime ? new Date(appointment.appointmentDateTime).getTime() : 0
      const existingAppointmentTime = existing?.appointmentDateTime ? new Date(existing.appointmentDateTime).getTime() : 0

      if (!existing) {
        grouped.set(appointment.patientId, {
          patientId: appointment.patientId,
          appointmentCount: 1,
          latestAppointment: appointment,
        })
        return
      }

      grouped.set(appointment.patientId, {
        patientId: appointment.patientId,
        appointmentCount: existing.appointmentCount + 1,
        latestAppointment: currentAppointmentTime >= existingAppointmentTime ? appointment : existing.latestAppointment,
      })
    })

    return Array.from(grouped.values()).sort((left, right) => {
      const leftTime = left.latestAppointment?.appointmentDateTime ? new Date(left.latestAppointment.appointmentDateTime).getTime() : 0
      const rightTime = right.latestAppointment?.appointmentDateTime ? new Date(right.latestAppointment.appointmentDateTime).getTime() : 0
      return rightTime - leftTime
    })
  }, [appointments])

  return (
    <DoctorPageLayout activeLabel="Patients" title="Patients">
      <div className="rounded-xl border border-[#e8ecf4] bg-white p-6 space-y-4">
        <div>
          <p className="text-lg font-semibold text-[#1b2435]">Booked Patients</p>
          <p className="mt-1 text-sm text-slate-600">Patients who have booked appointments with you will appear here.</p>
        </div>

        {errorMessage && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {errorMessage}
          </div>
        )}

        {loading ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Loading booked patients...</div>
        ) : bookedPatients.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">No booked patients found yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">Patient ID</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">Patient Name</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">Bookings</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">Latest Specialty</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">Latest Type</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">Latest Date & Time</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookedPatients.map((entry) => (
                  <tr key={entry.patientId}>
                    <td className="px-3 py-2 text-slate-700">{entry.patientId}</td>
                    <td className="px-3 py-2 text-slate-700">{patientNames[entry.patientId] || entry.patientId}</td>
                    <td className="px-3 py-2 text-slate-700">{entry.appointmentCount}</td>
                    <td className="px-3 py-2 text-slate-700">{entry.latestAppointment?.specialty || '-'}</td>
                    <td className="px-3 py-2 text-slate-700">{entry.latestAppointment?.type || '-'}</td>
                    <td className="px-3 py-2 text-slate-700">
                      {entry.latestAppointment?.appointmentDateTime ? new Date(entry.latestAppointment.appointmentDateTime).toLocaleString() : '-'}
                    </td>
                    <td className="px-3 py-2 text-slate-700">{entry.latestAppointment?.status || '-'}</td>
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
