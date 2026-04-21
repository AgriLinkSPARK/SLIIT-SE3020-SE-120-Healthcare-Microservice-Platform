import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Calendar, Clock, Video, User, FileText } from 'lucide-react'
import Loader from '../../components/common/Loader'
import DoctorCard from '../../components/patient/DoctorCard'
import { bookAppointment, getAllDoctors, getDoctorAvailability } from '../../services/patientService'
import { getCurrentUser } from '../../utils/tokenUtils'

const steps = [
  { id: 1, title: 'Select Doctor', icon: User },
  { id: 2, title: 'Date & Time', icon: Calendar },
  { id: 3, title: 'Details', icon: FileText },
  { id: 4, title: 'Confirm', icon: Check },
]

export default function BookAppointmentPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const preselectedDoctor = location.state?.selectedDoctor

  const [currentStep, setCurrentStep] = useState(preselectedDoctor ? 2 : 1)
  const [loading, setLoading] = useState(false)
  const [doctors, setDoctors] = useState([])
  const [doctorsLoading, setDoctorsLoading] = useState(!preselectedDoctor)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    doctorId: preselectedDoctor?.id || '',
    doctorName: preselectedDoctor ? `Dr. ${preselectedDoctor.firstName} ${preselectedDoctor.lastName}` : '',
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    notes: '',
    isVirtual: false,
  })

  const [availableSlots, setAvailableSlots] = useState([])
  const [selectedDateSlots, setSelectedDateSlots] = useState([])

  const currentUser = getCurrentUser()
  const patientId = currentUser?.id

  useEffect(() => {
    if (!preselectedDoctor) {
      const fetchDoctors = async () => {
        try {
          setDoctorsLoading(true)
          const data = await getAllDoctors()
          setDoctors(data || [])
        } catch (err) {
          setError('Failed to load doctors')
        } finally {
          setDoctorsLoading(false)
        }
      }
      fetchDoctors()
    }
  }, [preselectedDoctor])

  useEffect(() => {
    if (formData.doctorId && currentStep === 2) {
      const fetchAvailability = async () => {
        try {
          setLoading(true)
          const data = await getDoctorAvailability(formData.doctorId)
          setAvailableSlots(data || [])
        } catch (err) {
          setAvailableSlots([])
        } finally {
          setLoading(false)
        }
      }
      fetchAvailability()
    }
  }, [formData.doctorId, currentStep])

  useEffect(() => {
    if (formData.appointmentDate && availableSlots.length > 0) {
      const slots = availableSlots.filter(
        (slot) => slot.date === formData.appointmentDate && slot.available
      )
      setSelectedDateSlots(slots)
    } else {
      setSelectedDateSlots([])
    }
  }, [formData.appointmentDate, availableSlots])

  const handleDoctorSelect = (doctor) => {
    setFormData((prev) => ({
      ...prev,
      doctorId: doctor.id,
      doctorName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
    }))
    setCurrentStep(2)
  }

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.doctorId) {
          setError('Please select a doctor')
          return false
        }
        break
      case 2:
        if (!formData.appointmentDate) {
          setError('Please select a date')
          return false
        }
        if (!formData.appointmentTime) {
          setError('Please select a time slot')
          return false
        }
        break
      case 3:
        if (!formData.reason.trim()) {
          setError('Please provide a reason for the appointment')
          return false
        }
        break
      default:
        break
    }
    setError('')
    return true
  }

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length))
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    setError('')
  }

  const handleSubmit = async () => {
    if (!validateStep()) return

    try {
      setSubmitting(true)
      setError('')

      const appointmentData = {
        doctorId: formData.doctorId,
        doctorName: formData.doctorName,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        reason: formData.reason,
        notes: formData.notes,
        isVirtual: formData.isVirtual,
      }

      await bookAppointment(patientId, appointmentData)
      setCurrentStep(4)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const getAvailableDates = () => {
    const dates = [...new Set(availableSlots.map((slot) => slot.date))]
    return dates.sort()
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">Select a Doctor</h2>
            {doctorsLoading ? (
              <Loader />
            ) : doctors.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                <p className="text-slate-500">No doctors available</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {doctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    onClick={() => handleDoctorSelect(doctor)}
                    className={`cursor-pointer rounded-2xl border-2 p-4 transition-all ${
                      formData.doctorId === doctor.id
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-slate-200 bg-white hover:border-brand-300'
                    }`}
                  >
                    <DoctorCard doctor={doctor} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-800">Select Date & Time</h2>

            {loading ? (
              <Loader />
            ) : (
              <>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    <Calendar className="mr-1 inline h-4 w-4" />
                    Available Dates
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {getAvailableDates().length === 0 ? (
                      <p className="text-sm text-slate-500">No available dates</p>
                    ) : (
                      getAvailableDates().map((date) => (
                        <button
                          key={date}
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, appointmentDate: date, appointmentTime: '' }))
                          }
                          className={`rounded-lg px-4 py-2 text-sm font-medium ${
                            formData.appointmentDate === date
                              ? 'bg-brand-500 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {new Date(date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {formData.appointmentDate && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      <Clock className="mr-1 inline h-4 w-4" />
                      Available Time Slots
                    </label>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {selectedDateSlots.length === 0 ? (
                        <p className="col-span-full text-sm text-slate-500">No available slots for this date</p>
                      ) : (
                        selectedDateSlots.map((slot) => (
                          <button
                            key={slot.time}
                            onClick={() =>
                              setFormData((prev) => ({ ...prev, appointmentTime: slot.time }))
                            }
                            className={`rounded-lg px-3 py-2 text-sm font-medium ${
                              formData.appointmentTime === slot.time
                                ? 'bg-brand-500 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {slot.time}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={formData.isVirtual}
                      onChange={(e) => setFormData((prev) => ({ ...prev, isVirtual: e.target.checked }))}
                      className="h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500"
                    />
                    <Video className="h-4 w-4" />
                    Video Consultation
                  </label>
                </div>
              </>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">Appointment Details</h2>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Reason for Visit *
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
                rows={3}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                placeholder="Briefly describe your symptoms or reason for the appointment"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Additional Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                rows={2}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                placeholder="Any additional information for the doctor"
              />
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-800">Appointment Booked!</h2>
            <p className="text-slate-600">
              Your appointment has been successfully scheduled with {formData.doctorName}.
            </p>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">
              <p className="text-sm text-slate-600">
                <strong>Date:</strong>{' '}
                {new Date(formData.appointmentDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <p className="text-sm text-slate-600">
                <strong>Time:</strong> {formData.appointmentTime}
              </p>
              <p className="text-sm text-slate-600">
                <strong>Type:</strong> {formData.isVirtual ? 'Video Consultation' : 'In-Person Visit'}
              </p>
            </div>
            <button
              onClick={() => navigate('/patient/appointments')}
              className="rounded-full bg-brand-500 px-6 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              View My Appointments
            </button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => navigate('/patient/dashboard')}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        <h1 className="mb-6 text-2xl font-semibold text-slate-800">Book Appointment</h1>

        {currentStep !== 4 && (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.slice(0, 3).map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      currentStep >= step.id
                        ? 'bg-brand-500 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    <step.icon className="h-5 w-5" />
                  </div>
                  {index < 2 && (
                    <div
                      className={`mx-2 h-1 w-12 sm:w-20 ${
                        currentStep > step.id ? 'bg-brand-500' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {renderStepContent()}

          {currentStep < 4 && (
            <div className="mt-8 flex justify-between">
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              {currentStep < 3 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 rounded-full bg-brand-500 px-6 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-full bg-brand-500 px-6 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {submitting ? 'Booking...' : 'Confirm Booking'}
                  <Check className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
