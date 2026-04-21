import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { bookAppointment } from '../../services/appointmentService'
import { getDoctorBookingOptions, getDoctorCategories } from '../../services/doctorService'
import { createVideoSession } from '../../services/telemedicineService'

const resolvePatientId = (user) => {
  const candidates = [
    user?.patientId,
    user?.userId,
    user?.id,
    user?._id,
    user?.data?.patientId,
    user?.data?.userId,
    user?.data?.id,
    user?.data?._id,
    user?.user?.patientId,
    user?.user?.userId,
    user?.user?.id,
    user?.user?._id,
    localStorage.getItem('patientId'),
    localStorage.getItem('userId'),
  ]

  const value = candidates.find((item) => typeof item === 'string' && item.trim())
  return value || ''
}

const APPOINTMENT_TYPES = [
  { value: 'ONLINE_VIDEO', label: 'Online Video Appointment' },
  { value: 'PHYSICAL_VISIT', label: 'Physical Visit Appointment' },
]

const resolveDisplayDoctorName = (doctor) => {
  if (doctor?.fullName && doctor.fullName.trim()) {
    return doctor.fullName.trim()
  }

  if (doctor?.doctorId && doctor.doctorId.trim()) {
    const shortId = doctor.doctorId.length > 8 ? doctor.doctorId.slice(0, 8) : doctor.doctorId
    return `Doctor ${shortId}`
  }

  return 'Doctor'
}

const resolveEmail = (user) => {
  const candidates = [user?.email, user?.user?.email]
  return candidates.find((item) => typeof item === 'string' && item.trim()) || ''
}

const formatInstantForDatetimeLocal = (instantValue) => {
  if (!instantValue) return ''

  const date = new Date(instantValue)
  const pad = (value) => String(value).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export default function BookAppointmentPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [doctorNameQuery, setDoctorNameQuery] = useState('')
  const [scheduleDate, setScheduleDate] = useState('')
  const [selectedSlotId, setSelectedSlotId] = useState('')
  const [type, setType] = useState('ONLINE_VIDEO')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [doctorOptions, setDoctorOptions] = useState([])
  const [doctorCategories, setDoctorCategories] = useState([])
  const [optionsLoading, setOptionsLoading] = useState(true)

  const patientId = useMemo(() => resolvePatientId(user), [user])
  const selectedCategory = useMemo(
    () => doctorCategories.find((category) => category.id === selectedCategoryId) || null,
    [doctorCategories, selectedCategoryId],
  )

  const normalizedDoctorNameQuery = useMemo(() => doctorNameQuery.trim().toLowerCase(), [doctorNameQuery])

  const categorySchedules = useMemo(() => {
    return doctorOptions.flatMap((doctor) =>
      (doctor.availabilitySlots || []).map((slot) => ({
        ...slot,
        doctorId: doctor.doctorId,
        doctorName: resolveDisplayDoctorName(doctor),
        specialization: slot.specialization || doctor.specialization,
        consultationFee: slot.consultationFee || doctor.consultationFee,
      })),
    )
  }, [doctorOptions])

  const visibleSchedules = useMemo(() => {
    if (!selectedCategory) {
      return []
    }

    return categorySchedules.filter((slot) => {
      const selectedCategoryName = (selectedCategory?.name || '').toLowerCase()
      const matchesCategory =
        !selectedCategoryName ||
        (slot.specialization || '').toLowerCase().includes(selectedCategoryName)

      const matchesName =
        !normalizedDoctorNameQuery ||
        (slot.doctorName || '').toLowerCase().includes(normalizedDoctorNameQuery)

      const matchesDate = !scheduleDate || slot.startTime?.slice(0, 10) === scheduleDate

      return matchesCategory && matchesName && matchesDate
    })
  }, [categorySchedules, normalizedDoctorNameQuery, scheduleDate, selectedCategory])

  const selectedSchedule = useMemo(
    () => visibleSchedules.find((slot) => slot.slotId === selectedSlotId) || null,
    [visibleSchedules, selectedSlotId],
  )

  const fetchDoctorSchedules = async (filters = {}) => {
    setOptionsLoading(true)
    setErrorMessage('')

    try {
      if (!filters.specialty) {
        setDoctorOptions([])
        setSelectedSlotId('')
        return 0
      }

      const doctorsData = await getDoctorBookingOptions(filters)
      const doctors = Array.isArray(doctorsData) ? doctorsData : []
      setDoctorOptions(doctors)

      const normalizedSearchName = (filters.doctorName ?? doctorNameQuery).trim().toLowerCase()
      const searchDate = filters.date ?? scheduleDate
      const searchCategoryName = (selectedCategory?.name || '').toLowerCase()

      const filteredSlots = doctors
        .flatMap((doctor) =>
          (doctor.availabilitySlots || []).map((slot) => ({
            ...slot,
            doctorId: doctor.doctorId,
            doctorName: resolveDisplayDoctorName(doctor),
            specialization: slot.specialization || doctor.specialization,
            consultationFee: slot.consultationFee || doctor.consultationFee,
          })),
        )
        .filter((slot) => {
          const matchesCategory =
            !searchCategoryName ||
            (slot.specialization || '').toLowerCase().includes(searchCategoryName)
          const matchesName =
            !normalizedSearchName ||
            (slot.doctorName || '').toLowerCase().includes(normalizedSearchName)
          const matchesDate = !searchDate || slot.startTime?.slice(0, 10) === searchDate

          return matchesCategory && matchesName && matchesDate
        })

      setSelectedSlotId(filteredSlots[0]?.slotId || '')
      return filteredSlots.length
    } catch (error) {
      setDoctorOptions([])
      setSelectedSlotId('')
      setErrorMessage(error.response?.data?.message || 'Failed to load doctor schedules')
      return 0
    } finally {
      setOptionsLoading(false)
    }
  }

  useEffect(() => {
    const loadBookingData = async () => {
      setOptionsLoading(true)
      setErrorMessage('')
      try {
        const [categoriesData] = await Promise.all([
          getDoctorCategories(),
        ])

        const categories = Array.isArray(categoriesData) ? categoriesData : []

        setDoctorCategories(categories)
        setDoctorOptions([])
        setSelectedSlotId('')
      } catch (error) {
        setDoctorOptions([])
        setDoctorCategories([])
        setSelectedSlotId('')
        setErrorMessage(error.response?.data?.message || 'Failed to load doctor schedules')
      }
    }

    // eslint-disable-next-line no-void
    loadBookingData()
  }, [])

  useEffect(() => {
    if (!selectedCategory) {
      setDoctorOptions([])
      setSelectedSlotId('')
      return
    }

    const loadCategorySchedules = async () => {
      await fetchDoctorSchedules({
        specialty: selectedCategory.name,
        doctorName: doctorNameQuery.trim() || undefined,
        date: scheduleDate || undefined,
      })
    }

    // eslint-disable-next-line no-void
    loadCategorySchedules()
  }, [selectedCategory, doctorNameQuery, scheduleDate])

  useEffect(() => {
    if (!selectedSlotId) {
      return
    }

    const stillVisible = visibleSchedules.some((slot) => slot.slotId === selectedSlotId)
    if (!stillVisible) {
      const nextSlot = visibleSchedules[0]
      if (!nextSlot) {
        setSelectedSlotId('')
        return
      }

      setSelectedSlotId(nextSlot.slotId)
    }
  }, [selectedSlotId, visibleSchedules])

  const handleBookAppointment = async (schedule) => {
    setErrorMessage('')

    if (!patientId) {
      setErrorMessage('Patient session not found. Please log in again.')
      return
    }

    if (!schedule) {
      setErrorMessage('Please choose an available schedule for the selected category.')
      return
    }

    const scheduleFee = Number(schedule.consultationFee || 0)
    if (!scheduleFee || scheduleFee <= 0) {
      setErrorMessage('Selected doctor schedule does not have a valid consultation fee.')
      return
    }

    const selectedTypeCapacity =
      type === 'ONLINE_VIDEO'
        ? Number(schedule.onlineCapacity || 0)
        : Number(schedule.physicalCapacity || 0)

    if (selectedTypeCapacity <= 0) {
      setErrorMessage(
        type === 'ONLINE_VIDEO'
          ? 'Selected schedule has no Online slots left. Choose Physical Visit or another schedule.'
          : 'Selected schedule has no Physical slots left. Choose Online Video or another schedule.',
      )
      return
    }

    try {
      setLoading(true)
      const createdAppointment = await bookAppointment({
        patientId,
        doctorId: schedule.doctorId,
        slotId: schedule.slotId,
        doctorName: schedule.doctorName,
        specialty: schedule.specialization || selectedCategory?.name || '',
        type,
        appointmentDateTime: formatInstantForDatetimeLocal(schedule.startTime),
        fee: scheduleFee,
        onlineCapacity: Number(schedule.onlineCapacity || 0),
        physicalCapacity: Number(schedule.physicalCapacity || 0),
      })

      if (type === 'ONLINE_VIDEO') {
        try {
          await createVideoSession({
            appointmentId: createdAppointment.id,
            patientId,
            patientName: user?.fullName || user?.name || user?.firstName || 'Patient',
            patientEmail: resolveEmail(user),
            doctorId: createdAppointment.doctorId || schedule.doctorId,
            doctorName: createdAppointment.doctorName || schedule.doctorName || 'Doctor',
            doctorEmail: schedule.doctorEmail || schedule.email || '',
            scheduledStartTime: new Date(schedule.startTime).toISOString(),
            durationMinutes: Number(createdAppointment.durationMinutes || 30),
            notes: createdAppointment.notes || '',
          })
        } catch (sessionError) {
          if (sessionError.response?.status !== 409) {
            // Appointment booking must still succeed even if telemedicine provisioning is temporarily blocked.
            console.warn('Telemedicine session creation failed after booking', sessionError)
          }
        }
      }

      const params = new URLSearchParams({
        consultationId: createdAppointment.id,
        doctorId: createdAppointment.doctorId || schedule.doctorId,
        amount: String(createdAppointment.fee || scheduleFee),
      })

      navigate(`/patient/payments?${params.toString()}`)
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to book appointment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearchSchedules = async () => {
    if (!selectedCategory) {
      setErrorMessage('Select a doctor category first to view schedules.')
      return
    }

    const filters = {
      specialty: selectedCategory?.name || undefined,
      doctorName: doctorNameQuery.trim() || undefined,
      date: scheduleDate || undefined,
    }

    const matchedCount = await fetchDoctorSchedules(filters)

    if (matchedCount === 0) {
      setErrorMessage('No schedules found for selected filters. Try another category, doctor name, or date.')
    }
  }

  return (
    <div className="p-6">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold">Book Doctor Appointment</h1>
        <p className="mt-2 text-sm text-slate-600">
          Filter by category, doctor name, and date to find matching schedules, then choose one to book.
        </p>
      </div>

      <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 md:grid-cols-2">
        <label className="space-y-1 md:col-span-1">
          <span className="text-sm font-medium text-slate-700">Appointment Type</span>
          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {APPOINTMENT_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 md:col-span-1">
          <span className="text-sm font-medium text-slate-700">Search Doctor by Name</span>
          <input
            type="text"
            value={doctorNameQuery}
            onChange={(event) => {
              setDoctorNameQuery(event.target.value)
              setSelectedSlotId('')
            }}
            placeholder="e.g. Dr. Amara Fernando"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-1 md:col-span-1">
          <span className="text-sm font-medium text-slate-700">Schedule Date</span>
          <input
            type="date"
            value={scheduleDate}
            onChange={(event) => {
              setScheduleDate(event.target.value)
              setSelectedSlotId('')
            }}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <p className="text-xs text-slate-500">Optional. Shows doctors available on this day.</p>
        </label>

        <label className="space-y-1 md:col-span-1">
          <span className="text-sm font-medium text-slate-700">Doctor Category</span>
          <select
            value={selectedCategoryId}
            onChange={(event) => {
              setSelectedCategoryId(event.target.value)
              setSelectedSlotId('')
            }}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Select category</option>
            {doctorCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {selectedCategory && (
            <p className="text-xs text-slate-600">{selectedCategory.description}</p>
          )}
          {!selectedCategory && (
            <p className="text-xs text-slate-500">Optional when searching by doctor name.</p>
          )}
        </label>

        <div className="md:col-span-2">
          <button
            type="button"
            onClick={handleSearchSchedules}
            disabled={optionsLoading}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Search Schedules
          </button>
        </div>

        <div className="space-y-1 md:col-span-2">
          <span className="text-sm font-medium text-slate-700">Available Schedules</span>
          {!selectedCategory && (
            <p className="text-xs text-slate-500">Select a doctor category to load matching schedules.</p>
          )}
          <div className="grid gap-3">
            {visibleSchedules.map((slot) => {
              const isSelected = slot.slotId === selectedSlotId
              return (
                <div
                  key={slot.slotId}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedSlotId(slot.slotId)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setSelectedSlotId(slot.slotId)
                    }
                  }}
                  className={`w-full rounded-lg border px-4 py-3 text-left transition ${
                    isSelected
                      ? 'cursor-pointer border-brand-500 bg-brand-50 ring-1 ring-brand-200'
                      : 'cursor-pointer border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-800">{slot.doctorName}</p>
                  <p className="text-xs text-slate-600">{slot.specialization || 'General Consultation'}</p>
                  <p className="mt-1 text-sm text-slate-700">{new Date(slot.startTime).toLocaleString()}</p>
                  <p className="text-xs text-slate-600">{slot.locationType} | Fee: ${Number(slot.consultationFee || 0).toFixed(2)}</p>
                  <p className="text-xs text-slate-600">
                    Online: {slot.onlineCapacity || 0} slots | Physical: {slot.physicalCapacity || 0} slots
                  </p>
                </div>
              )
            })}
          </div>
          {(selectedCategory || normalizedDoctorNameQuery || scheduleDate) && visibleSchedules.length === 0 && (
            <p className="text-xs text-amber-700">No available schedules found for the current filters.</p>
          )}
        </div>

        {selectedSchedule && (
          <div className="md:col-span-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-800">Selected Schedule Information</p>
            <p className="mt-1 text-sm text-slate-600">
              {`${selectedSchedule.doctorName} • ${new Date(selectedSchedule.startTime).toLocaleString()} • ${selectedSchedule.locationType}`}
            </p>
            <button
              type="button"
              onClick={() => handleBookAppointment(selectedSchedule)}
              disabled={loading}
              className="mt-3 inline-flex items-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Booking...' : 'Proceed to Payment'}
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="md:col-span-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {errorMessage}
          </div>
        )}

      </div>
    </div>
  )
}
