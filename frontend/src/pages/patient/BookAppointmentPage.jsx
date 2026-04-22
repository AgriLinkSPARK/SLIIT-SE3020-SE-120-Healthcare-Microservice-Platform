import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Search, Clock, MapPin, Video, Loader2, Stethoscope, ChevronRight, AlertCircle } from 'lucide-react'
import PatientPageLayout from '../../components/patient/PatientPageLayout'
import useAuth from '../../hooks/useAuth'
import { bookAppointment } from '../../services/appointmentService'
import { getDoctorBookingOptions, getDoctorCategories } from '../../services/doctorService'
import { createVideoSession } from '../../services/telemedicineService'

const resolvePatientId = (user) => {
  const candidates = [
    user?.userId,
    user?.patientId,
    user?.user?.userId,
    user?.user?.patientId,
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

  const getAppointmentTypeIcon = () => {
    return type === 'ONLINE_VIDEO' ? Video : MapPin
  }

  const AppointmentTypeIcon = getAppointmentTypeIcon()

  return (
    <PatientPageLayout 
      title="Book Doctor Appointment" 
      subtitle="Find and book appointments with our qualified healthcare professionals"
    >
      <div className="space-y-6">
        {/* Error Message */}
        {errorMessage && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            {errorMessage}
          </div>
        )}

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Find Available Slots</h2>
                <p className="text-sm text-slate-500">Filter by category, doctor, and date</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid gap-5 md:grid-cols-2">
              {/* Appointment Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <AppointmentTypeIcon className="h-4 w-4 text-slate-400" />
                  Appointment Type
                </label>
                <div className="flex rounded-xl border border-slate-200 p-1 bg-slate-50">
                  {APPOINTMENT_TYPES.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setType(option.value)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        type === option.value
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Doctor Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-slate-400" />
                  Doctor Category
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={(event) => {
                    setSelectedCategoryId(event.target.value)
                    setSelectedSlotId('')
                  }}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all bg-white"
                >
                  <option value="">Select a category</option>
                  {doctorCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {selectedCategory && (
                  <p className="text-xs text-slate-500">{selectedCategory.description}</p>
                )}
              </div>

              {/* Search Doctor */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Search className="h-4 w-4 text-slate-400" />
                  Search Doctor by Name
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={doctorNameQuery}
                    onChange={(event) => {
                      setDoctorNameQuery(event.target.value)
                      setSelectedSlotId('')
                    }}
                    placeholder="e.g. Dr. Amara Fernando"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Schedule Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  Schedule Date (Optional)
                </label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(event) => {
                    setScheduleDate(event.target.value)
                    setSelectedSlotId('')
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Search Button */}
            <button
              type="button"
              onClick={handleSearchSchedules}
              disabled={optionsLoading || (!selectedCategory && !doctorNameQuery.trim())}
              className="mt-6 w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {optionsLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Search Schedules
                </>
              )}
            </button>
          </div>
        </div>

        {/* Available Schedules */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Available Schedules</h2>
                  <p className="text-sm text-slate-500">
                    {visibleSchedules.length} {visibleSchedules.length === 1 ? 'slot' : 'slots'} available
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {!selectedCategory && !doctorNameQuery.trim() ? (
              <div className="text-center py-12">
                <div className="mx-auto h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-base font-medium text-slate-900 mb-1">Select filters to see schedules</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Choose a doctor category or search by name to find available appointment slots
                </p>
              </div>
            ) : visibleSchedules.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                  <AlertCircle className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="text-base font-medium text-slate-900 mb-1">No schedules found</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  No available schedules match your current filters. Try adjusting your search criteria.
                </p>
              </div>
            ) : (
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
                      className={`w-full rounded-xl border p-4 text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200'
                          : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">{slot.doctorName}</p>
                          <p className="text-sm text-slate-500">{slot.specialization || 'General Consultation'}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                          ${Number(slot.consultationFee || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Clock className="h-4 w-4 text-slate-400" />
                          {new Date(slot.startTime).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          {slot.locationType}
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Video className="h-3 w-3" />
                          Online: {slot.onlineCapacity || 0} slots
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          Physical: {slot.physicalCapacity || 0} slots
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Selected Schedule & Book Button */}
        {selectedSchedule && (
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-200 overflow-hidden">
            <div className="p-6 text-white">
              <h3 className="text-lg font-semibold mb-1">Selected Appointment</h3>
              <p className="text-blue-100 text-sm mb-4">Review your selection and proceed to payment</p>
              
              <div className="bg-white/10 rounded-xl p-4 mb-6 backdrop-blur-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{selectedSchedule.doctorName}</p>
                    <p className="text-sm text-blue-100">{selectedSchedule.specialization || 'General Consultation'}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(selectedSchedule.startTime).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {selectedSchedule.locationType}
                      </span>
                    </div>
                  </div>
                  <span className="px-4 py-2 rounded-full bg-white text-blue-600 font-bold">
                    ${Number(selectedSchedule.consultationFee || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleBookAppointment(selectedSchedule)}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Booking...
                  </>
                ) : (
                  <>
                    Proceed to Payment
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </PatientPageLayout>
  )
}
