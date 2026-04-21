import { useCallback, useEffect, useState } from 'react'
import DoctorPageLayout from '../../components/doctor/DoctorPageLayout'
import {
  createDoctorAvailability,
  deleteDoctorAvailability,
  getDoctorAvailability,
  getDoctorProfile,
} from '../../services/doctorService'

const DEFAULT_FORM = {
  startTime: '',
  endTime: '',
  locationType: 'VIDEO',
  onlineCapacity: 20,
  physicalCapacity: 20,
  consultationFee: 1,
  notes: '',
}

export default function AvailabilityPage() {
  const [form, setForm] = useState(DEFAULT_FORM)
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [doctorProfile, setDoctorProfile] = useState(null)

  const loadAvailability = useCallback(async () => {
    setLoading(true)
    setErrorMessage('')
    try {
      const [availabilityResult, doctorProfileResult] = await Promise.allSettled([
        getDoctorAvailability(),
        getDoctorProfile(),
      ])
      const availabilityData = availabilityResult.status === 'fulfilled' ? availabilityResult.value : []
      const doctorProfileData = doctorProfileResult.status === 'fulfilled' ? doctorProfileResult.value : null

      setSlots(Array.isArray(availabilityData) ? availabilityData : [])
      setDoctorProfile(doctorProfileData || null)

      if (doctorProfileData?.specialization) {
        setForm((previous) => ({
          ...previous,
          specialization: doctorProfileData.specialization,
          consultationFee: Number(doctorProfileData.consultationFee || 1),
        }))
      } else {
        setForm(DEFAULT_FORM)
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to load your schedule')
      setSlots([])
      setDoctorProfile(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAvailability()
  }, [loadAvailability])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((previous) => ({
      ...previous,
      [name]: name === 'onlineCapacity' || name === 'physicalCapacity' || name === 'consultationFee' ? Number(value) : value,
    }))
  }

  const handleCreate = async (event) => {
    event.preventDefault()
    setErrorMessage('')

    if (!form.startTime || !form.endTime) {
      setErrorMessage('Start and end time are required')
      return
    }

    if (form.onlineCapacity <= 0 && form.physicalCapacity <= 0) {
      setErrorMessage('Set at least one capacity greater than 0')
      return
    }

    if (!doctorProfile?.specialization) {
      setErrorMessage('Complete your doctor profile first so schedules inherit your category')
      return
    }

    try {
      setSaving(true)
      await createDoctorAvailability({
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
        locationType: form.locationType,
        specialization: doctorProfile.specialization,
        onlineCapacity: form.onlineCapacity,
        physicalCapacity: form.physicalCapacity,
          consultationFee: Number(form.consultationFee || doctorProfile?.consultationFee || 1),
        notes: form.notes?.trim() || null,
      })

      setForm(DEFAULT_FORM)
      await loadAvailability()
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to add schedule')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (slotId) => {
    try {
      await deleteDoctorAvailability(slotId)
      await loadAvailability()
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to delete schedule')
    }
  }

  return (
    <DoctorPageLayout activeLabel="Schedule" title="Schedule">
      <div className="space-y-4">
        <div className="grid gap-3 rounded-xl border border-[#e8ecf4] bg-white p-6 md:grid-cols-3">
          <div>
            <p className="text-sm font-semibold text-slate-700">Doctor Details</p>
            <p className="mt-1 text-sm text-slate-600">{doctorProfile?.fullName || 'Profile not set'}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">Email</p>
            <p className="mt-1 text-sm text-slate-600">{doctorProfile?.email || 'Not available'}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">Category</p>
            <p className="mt-1 text-sm text-slate-600">{doctorProfile?.specialization || 'Complete profile to choose a category'}</p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="grid gap-4 rounded-xl border border-[#e8ecf4] bg-white p-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <p className="text-lg font-semibold text-[#1b2435]">Add Practice Schedule</p>
            <p className="mt-1 text-sm text-slate-600">Schedules inherit the category from your doctor profile.</p>
          </div>

          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700">Start Time</span>
            <input
              type="datetime-local"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700">End Time</span>
            <input
              type="datetime-local"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700">Consultation Mode</span>
            <select
              name="locationType"
              value={form.locationType}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="VIDEO">Online</option>
              <option value="IN_PERSON">Physical</option>
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700">Online Appointment Capacity</span>
            <input
              type="number"
              name="onlineCapacity"
              min="0"
              value={form.onlineCapacity}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700">Physical Appointment Capacity</span>
            <input
              type="number"
              name="physicalCapacity"
              min="0"
              value={form.physicalCapacity}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700">Schedule Consultation Fee (USD)</span>
            <input
              type="number"
              name="consultationFee"
              min="1"
              step="1"
              value={form.consultationFee}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Notes</span>
            <input
              type="text"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Optional notes for this schedule"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? 'Saving...' : 'Add Schedule'}
            </button>
          </div>
        </form>

        {errorMessage && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {errorMessage}
          </div>
        )}

        <div className="rounded-xl border border-[#e8ecf4] bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-lg font-semibold text-[#1b2435]">My Schedule Slots</p>
            <button
              type="button"
              onClick={loadAvailability}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-slate-600">Loading schedules...</p>
          ) : slots.length === 0 ? (
            <p className="text-sm text-slate-600">No schedules added yet.</p>
          ) : (
            <div className="space-y-3">
              {slots.map((slot) => (
                <div key={slot.id} className="rounded-lg border border-slate-200 p-3">
                  <p className="text-sm font-semibold text-slate-800">
                    {new Date(slot.startTime).toLocaleString()} - {new Date(slot.endTime).toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-600">{slot.locationType} | Status: {slot.status}</p>
                  <p className="text-xs text-slate-600">Category: {slot.specialization || doctorProfile?.specialization || 'General Consultation'}</p>
                  <p className="text-xs text-slate-600">Fee: ${Number(slot.consultationFee || doctorProfile?.consultationFee || 0).toFixed(2)}</p>
                  <p className="text-xs text-slate-600">
                    Online: {slot.onlineCapacity || 0} | Physical: {slot.physicalCapacity || 0}
                  </p>
                  {slot.notes && <p className="mt-1 text-xs text-slate-600">{slot.notes}</p>}
                  <button
                    type="button"
                    onClick={() => handleDelete(slot.id)}
                    className="mt-2 rounded border border-rose-300 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DoctorPageLayout>
  )
}
