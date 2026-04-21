import { useCallback, useEffect, useMemo, useState } from 'react'
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
  const [isCreateOpen, setIsCreateOpen] = useState(false)
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

      setForm((previous) => ({
        ...previous,
        consultationFee: Number(doctorProfileData?.consultationFee || 1),
      }))
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

      setForm({
        ...DEFAULT_FORM,
        consultationFee: Number(doctorProfile?.consultationFee || 1),
      })
      setIsCreateOpen(false)
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

  const groupedSlots = useMemo(() => {
    const grouped = slots.reduce((accumulator, slot) => {
      const key = new Date(slot.startTime).toDateString()
      if (!accumulator[key]) {
        accumulator[key] = []
      }
      accumulator[key].push(slot)
      return accumulator
    }, {})

    return Object.entries(grouped)
      .map(([dateKey, dateSlots]) => ({
        dateKey,
        dateLabel: new Date(dateKey).toLocaleDateString(undefined, {
          weekday: 'long',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        slots: dateSlots.sort((first, second) => new Date(first.startTime) - new Date(second.startTime)),
      }))
      .sort((first, second) => new Date(first.dateKey) - new Date(second.dateKey))
  }, [slots])

  const availableCount = slots.filter((slot) => (slot.status || '').toUpperCase() === 'AVAILABLE').length
  const closedCount = slots.length - availableCount

  const openCreateModal = () => {
    setErrorMessage('')
    setForm({
      ...DEFAULT_FORM,
      consultationFee: Number(doctorProfile?.consultationFee || 1),
    })
    setIsCreateOpen(true)
  }

  const closeCreateModal = () => {
    if (saving) {
      return
    }
    setIsCreateOpen(false)
  }

  return (
    <DoctorPageLayout activeLabel="Schedule" title="Schedule">
      <div className="grid gap-4 xl:grid-cols-[300px,1fr]">
        <aside className="space-y-4">
          <div className="rounded-2xl border border-[#dce4f2] bg-white p-5 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#dce8fa] text-3xl font-semibold uppercase text-[#5f7ea8]">
              {(doctorProfile?.fullName || 'D').charAt(0)}
            </div>
            <p className="mt-3 text-xs uppercase tracking-[0.14em] text-slate-500">Doctor</p>
            <p className="mt-1 text-xl font-semibold text-[#174070]">{doctorProfile?.fullName || 'Profile not set'}</p>
            <p className="mt-1 text-sm uppercase tracking-[0.08em] text-slate-500">
              {doctorProfile?.specialization || 'Complete profile'}
            </p>
            <button
              type="button"
              onClick={openCreateModal}
              className="mt-5 w-full rounded-xl bg-[#145da0] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0d4f8d]"
            >
              Create Schedule
            </button>
          </div>

          <div className="rounded-2xl border border-[#dce4f2] bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-700">Schedule Summary</p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Total Sessions</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{slots.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Available</span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">{availableCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Closed</span>
                <span className="rounded-full bg-slate-200 px-3 py-1 text-sm font-semibold text-slate-700">{closedCount}</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500">{doctorProfile?.email || 'Email not available'}</p>
          </div>
        </aside>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#145da0] px-5 py-4 text-white shadow-sm">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-[#cae4ff]">{doctorProfile?.specialization || 'General'}</p>
              <p className="text-xl font-semibold">My Practice Schedule</p>
            </div>
            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-xl border border-white/50 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              + Create
            </button>
          </div>

          <div className="rounded-2xl border border-[#dce4f2] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-lg font-semibold text-[#1b2435]">Schedule Slots</p>
              <button
                type="button"
                onClick={loadAvailability}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                Refresh
              </button>
            </div>

            {errorMessage && (
              <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</div>
            )}

            {loading ? (
              <p className="text-sm text-slate-600">Loading schedules...</p>
            ) : groupedSlots.length === 0 ? (
              <p className="text-sm text-slate-600">No schedules added yet.</p>
            ) : (
              <div className="space-y-5">
                {groupedSlots.map((dateGroup) => (
                  <div key={dateGroup.dateKey}>
                    <p className="mb-2 text-2xl font-medium text-[#2c527a]">{dateGroup.dateLabel}</p>
                    <div className="space-y-3">
                      {dateGroup.slots.map((slot) => {
                        const isAvailable = (slot.status || '').toUpperCase() === 'AVAILABLE'
                        return (
                          <div
                            key={slot.id}
                            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                            style={{ borderLeftWidth: '6px', borderLeftColor: isAvailable ? '#15b75f' : '#ef4444' }}
                          >
                            <div className="grid gap-3 md:grid-cols-[1.5fr,1fr,1fr,auto] md:items-center">
                              <div>
                                <p className="text-lg font-semibold text-[#274f7b]">{doctorProfile?.specialization || slot.specialization || 'General'}</p>
                                <p className="text-sm text-slate-600">{slot.locationType === 'IN_PERSON' ? 'Physical Consultation' : 'Online Consultation'}</p>
                                {slot.notes && <p className="mt-1 text-sm text-slate-500">{slot.notes}</p>}
                              </div>
                              <div>
                                <p className="text-xl font-semibold text-[#1e40af]">
                                  {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                <p className="text-sm text-slate-500">
                                  to {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                              <div>
                                <p className="text-base font-semibold text-emerald-600">${Number(slot.consultationFee || 0).toFixed(2)}</p>
                                <p className="text-sm text-slate-500">
                                  {slot.onlineCapacity || 0} online | {slot.physicalCapacity || 0} physical
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <span
                                  className={`min-w-[120px] rounded-xl px-4 py-2 text-center text-sm font-semibold ${
                                    isAvailable ? 'bg-[#145da0] text-white' : 'bg-slate-300 text-slate-700'
                                  }`}
                                >
                                  {isAvailable ? 'Available' : 'Closed'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(slot.id)}
                                  className="rounded border border-rose-300 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-[#1b2435]">Add Practice Schedule</p>
                <p className="mt-1 text-sm text-slate-600">Schedules inherit the category from your doctor profile.</p>
              </div>
              <button
                type="button"
                onClick={closeCreateModal}
                className="rounded-lg border border-slate-200 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            {!doctorProfile?.specialization && (
              <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                Complete your doctor profile first so schedules inherit your category.
              </div>
            )}

            {errorMessage && (
              <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</div>
            )}

            <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">
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

              <div className="md:col-span-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !doctorProfile?.specialization}
                  className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? 'Saving...' : 'Add Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DoctorPageLayout>
  )
}
