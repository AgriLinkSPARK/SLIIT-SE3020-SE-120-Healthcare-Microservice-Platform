import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import DoctorPageLayout from '../../components/doctor/DoctorPageLayout'
import PrescriptionForm from '../../components/doctor/PrescriptionForm'
import useAuth from '../../hooks/useAuth'
import { getAppointmentsByDoctor } from '../../services/appointmentService'
import {
  getDoctorConsultations,
  getDoctorPrescriptions,
  issueDoctorPrescription,
} from '../../services/doctorService'

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

  return candidates.find((value) => typeof value === 'string' && value.trim()) || ''
}

const generatePrescriptionId = () => `rx-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

const splitMedications = (value) =>
  value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)

const resolvePatientName = (appointment) => {
  const candidates = [
    appointment?.patientName,
    appointment?.patientFullName,
    appointment?.patient?.fullName,
    appointment?.patient?.name,
    appointment?.patientFirstName,
    appointment?.name,
  ]

  return candidates.find((item) => typeof item === 'string' && item.trim()) || appointment?.patientId || 'Unknown patient'
}

export default function PrescriptionsPage() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const doctorId = useMemo(() => resolveDoctorId(user), [user])

  const [bookedAppointments, setBookedAppointments] = useState([])
  const [consultations, setConsultations] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState(searchParams.get('patientId') || '')

  const [form, setForm] = useState(() => ({
    prescriptionId: generatePrescriptionId(),
    patientId: searchParams.get('patientId') || '',
    consultationId: searchParams.get('consultationId') || '',
    diagnosis: searchParams.get('diagnosis') || '',
    medications: '',
    additionalNotes: '',
  }))

  useEffect(() => {
    let cancelled = false

    const loadData = async () => {
      try {
        setLoading(true)
        setErrorMessage('')

        const [appointmentData, consultationData, prescriptionData] = await Promise.all([
          doctorId ? getAppointmentsByDoctor(doctorId) : Promise.resolve([]),
          getDoctorConsultations(),
          getDoctorPrescriptions(),
        ])

        if (cancelled) return

        setBookedAppointments(Array.isArray(appointmentData) ? appointmentData : [])
        setConsultations(Array.isArray(consultationData) ? consultationData : [])
        setPrescriptions(Array.isArray(prescriptionData) ? prescriptionData : [])
      } catch (error) {
        if (cancelled) return
        setErrorMessage(error.response?.data?.message || 'Failed to load prescriptions')
        setBookedAppointments([])
        setConsultations([])
        setPrescriptions([])
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      cancelled = true
    }
  }, [doctorId])

  const handleFieldChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleGenerateNewId = () => {
    setForm((current) => ({ ...current, prescriptionId: generatePrescriptionId() }))
  }

  const bookedPatients = useMemo(() => {
    const patientsById = new Map()

    bookedAppointments
      .filter((appointment) => appointment?.patientId)
      .filter((appointment) => appointment.status !== 'CANCELLED')
      .forEach((appointment) => {
        const existing = patientsById.get(appointment.patientId)
        const currentTime = new Date(appointment.appointmentDateTime || 0).getTime()
        const existingTime = existing ? new Date(existing.appointmentDateTime || 0).getTime() : 0

        if (!existing || currentTime > existingTime) {
          patientsById.set(appointment.patientId, appointment)
        }
      })

    return Array.from(patientsById.values())
  }, [bookedAppointments])

  const consultationOptions = useMemo(
    () => consultations.filter((consultation) => !form.patientId || consultation.patientId === form.patientId),
    [consultations, form.patientId],
  )

  const visiblePrescriptions = useMemo(() => {
    const filtered = selectedPatientId
      ? prescriptions.filter((prescription) => prescription.patientId === selectedPatientId)
      : prescriptions

    return [...filtered].sort((first, second) => {
      const secondTime = new Date(second.issuedAt || second.createdAt || 0).getTime()
      const firstTime = new Date(first.issuedAt || first.createdAt || 0).getTime()
      return secondTime - firstTime
    })
  }, [prescriptions, selectedPatientId])

  const patientOptions = useMemo(
    () =>
      bookedPatients.map((appointment) => ({
        patientId: appointment.patientId,
        patientName: resolvePatientName(appointment),
      })),
    [bookedPatients],
  )

  const handleSelectPatient = (appointment) => {
    setSelectedPatientId(appointment.patientId || '')

    const matchedConsultation = consultations.find((consultation) => consultation.patientId === appointment.patientId)

    setForm((current) => ({
      ...current,
      patientId: appointment.patientId || '',
      consultationId: matchedConsultation?.consultationId || matchedConsultation?.id || current.consultationId,
    }))

    const next = new URLSearchParams(searchParams)
    if (appointment.patientId) {
      next.set('patientId', appointment.patientId)
    }
    if (matchedConsultation?.consultationId || matchedConsultation?.id) {
      next.set('consultationId', matchedConsultation.consultationId || matchedConsultation.id)
    }
    setSearchParams(next)
  }

  const clearSelectedPatient = () => {
    setSelectedPatientId('')
    const next = new URLSearchParams(searchParams)
    next.delete('patientId')
    setSearchParams(next)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!doctorId) {
      setErrorMessage('Doctor session not found. Please log in again.')
      return
    }

    const medications = splitMedications(form.medications)
    if (medications.length === 0) {
      setErrorMessage('Add at least one medication line.')
      return
    }

    try {
      setSaving(true)
      setErrorMessage('')
      setSuccessMessage('')

      await issueDoctorPrescription({
        prescriptionId: form.prescriptionId.trim(),
        patientId: form.patientId.trim(),
        consultationId: form.consultationId.trim(),
        diagnosis: form.diagnosis.trim(),
        medications,
        additionalNotes: form.additionalNotes.trim() || null,
      })

      setSuccessMessage('Prescription issued successfully.')
      setForm((current) => ({
        ...current,
        prescriptionId: generatePrescriptionId(),
        patientId: '',
        consultationId: '',
        diagnosis: '',
        medications: '',
        additionalNotes: '',
      }))
      setIsWriteModalOpen(false)

      const prescriptionData = await getDoctorPrescriptions()
      setPrescriptions(Array.isArray(prescriptionData) ? prescriptionData : [])
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to issue prescription')
    } finally {
      setSaving(false)
    }
  }

  const openWriteModal = () => {
    setErrorMessage('')
    setSuccessMessage('')
    setIsWriteModalOpen(true)
  }

  const closeWriteModal = () => {
    if (saving) {
      return
    }
    setIsWriteModalOpen(false)
  }

  const handlePatientChange = (patientId) => {
    const selected = bookedPatients.find((appointment) => appointment.patientId === patientId)

    if (selected) {
      handleSelectPatient(selected)
      return
    }

    setForm((current) => ({
      ...current,
      patientId,
      consultationId: '',
    }))
  }

  return (
    <DoctorPageLayout activeLabel="Prescriptions" title="Prescriptions">
      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <div className="rounded-xl border border-[#e8ecf4] bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-[#1b2435]">Booked patients</p>
                <p className="text-sm text-slate-500">Select a booked patient to issue a prescription.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={openWriteModal}
                  className="rounded-lg bg-brand-500 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700"
                >
                  Write Prescription
                </button>
              </div>
            </div>

            {loading ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Loading booked patients...</div>
            ) : bookedPatients.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                No booked patients found for this doctor.
              </div>
            ) : (
              <div className="space-y-3">
                {bookedPatients.map((appointment) => {
                  const isSelected = appointment.patientId === selectedPatientId

                  return (
                    <button
                      key={appointment.id || appointment.patientId}
                      type="button"
                      onClick={() => handleSelectPatient(appointment)}
                      className={`w-full rounded-xl border p-4 text-left transition ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-50 shadow-sm'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{appointment.patientName || appointment.patientId}</p>
                          <p className="text-xs text-slate-500">Patient ID: {appointment.patientId}</p>
                        </div>
                        <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-slate-500">
                          {appointment.status || 'BOOKED'}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-1 text-xs text-slate-600">
                        <p><span className="font-semibold text-slate-900">Type:</span> {appointment.type || '-'}</p>
                        <p><span className="font-semibold text-slate-900">Date:</span> {appointment.appointmentDateTime ? new Date(appointment.appointmentDateTime).toLocaleString() : '-'}</p>
                        <p><span className="font-semibold text-slate-900">Specialty:</span> {appointment.specialty || '-'}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-[#e8ecf4] bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-[#1b2435]">Recent prescriptions</p>
                <p className="text-sm text-slate-500">
                  {selectedPatientId
                    ? `Showing prescriptions for patient: ${selectedPatientId}`
                    : 'Showing all prescriptions, newest first.'}
                </p>
              </div>
              {selectedPatientId && (
                <button
                  type="button"
                  onClick={clearSelectedPatient}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Show all
                </button>
              )}
            </div>

            {loading ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Loading prescriptions...</div>
            ) : visiblePrescriptions.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                {selectedPatientId ? 'No prescriptions found for this patient.' : 'No prescriptions found.'}
              </div>
            ) : (
              <div className="space-y-3">
                {visiblePrescriptions.map((prescription) => (
                  <article key={prescription.id || prescription.prescriptionId} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{prescription.diagnosis}</p>
                        <p className="text-xs text-slate-500">Prescription ID: {prescription.prescriptionId}</p>
                      </div>
                      <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-slate-500">
                        {prescription.issuedAt ? new Date(prescription.issuedAt).toLocaleString() : 'Recently issued'}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-slate-700">
                      <p><span className="font-semibold text-slate-900">Patient:</span> {prescription.patientId}</p>
                      <p><span className="font-semibold text-slate-900">Consultation:</span> {prescription.consultationId}</p>
                      <div>
                        <p className="font-semibold text-slate-900">Medications:</p>
                        <ul className="mt-1 list-disc space-y-1 pl-5 text-slate-600">
                          {(prescription.medications || []).map((medication, index) => (
                            <li key={`${prescription.prescriptionId || prescription.id}-${index}`}>{medication}</li>
                          ))}
                        </ul>
                      </div>
                      {prescription.additionalNotes && (
                        <p><span className="font-semibold text-slate-900">Notes:</span> {prescription.additionalNotes}</p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-[#1b2435]">Write prescription</p>
                <p className="text-sm text-slate-500">Only patients with appointments are available in the dropdown.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGenerateNewId}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  New ID
                </button>
                <button
                  type="button"
                  onClick={closeWriteModal}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {successMessage}
              </div>
            )}

            <PrescriptionForm
              form={form}
              onChange={handleFieldChange}
              onSubmit={handleSubmit}
              saving={saving}
              consultations={consultationOptions}
              patients={patientOptions}
              onPatientChange={handlePatientChange}
            />
          </div>
        </div>
      )}
    </DoctorPageLayout>
  )
}
