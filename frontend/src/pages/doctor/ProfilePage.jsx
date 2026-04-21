import { useEffect, useState } from 'react'
import DoctorPageLayout from '../../components/doctor/DoctorPageLayout'
import useAuth from '../../hooks/useAuth'
import { getDoctorCategories, getDoctorProfile, upsertDoctorProfile } from '../../services/doctorService'

const DEFAULT_FORM = {
  fullName: '',
  email: '',
  specialization: '',
  qualifications: '',
  bio: '',
  yearsOfExperience: 0,
  consultationFee: 1,
  phone: '',
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [form, setForm] = useState(DEFAULT_FORM)
  const [doctorCategories, setDoctorCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true)
      setErrorMessage('')
      try {
        const [profileData, categoriesData] = await Promise.all([
          getDoctorProfile(),
          getDoctorCategories(),
        ])

        const categories = Array.isArray(categoriesData) ? categoriesData : []
        setDoctorCategories(categories)

        setForm({
          fullName: profileData?.fullName || user?.fullName || user?.name || '',
          email: profileData?.email || user?.email || '',
          specialization: profileData?.specialization || categories[0]?.name || '',
          qualifications: profileData?.qualifications || '',
          bio: profileData?.bio || '',
          yearsOfExperience: Number(profileData?.yearsOfExperience || 0),
          consultationFee: Number(profileData?.consultationFee || 1),
          phone: profileData?.phone || '',
        })
      } catch (error) {
        const categories = await getDoctorCategories().catch(() => [])
        const categoryList = Array.isArray(categories) ? categories : []
        setDoctorCategories(categoryList)
        setForm((previous) => ({
          ...previous,
          fullName: user?.fullName || user?.name || previous.fullName,
          email: user?.email || previous.email,
          specialization: previous.specialization || categoryList[0]?.name || '',
        }))
        if (error.response?.status !== 404) {
          setErrorMessage(error.response?.data?.message || 'Failed to load doctor profile')
        }
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((previous) => ({
      ...previous,
      [name]: name === 'yearsOfExperience' || name === 'consultationFee' ? Number(value) : value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await upsertDoctorProfile({
        fullName: form.fullName,
        email: form.email,
        specialization: form.specialization,
        qualifications: form.qualifications || 'To be updated',
        bio: form.bio,
        yearsOfExperience: Number(form.yearsOfExperience || 0),
        consultationFee: Number(form.consultationFee || 1),
        phone: form.phone,
      })
      setSuccessMessage('Profile saved successfully.')
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DoctorPageLayout activeLabel="Overview" title="Profile">
      <div className="space-y-4 rounded-xl border border-[#e8ecf4] bg-white p-6">
        <div>
          <p className="text-lg font-semibold text-[#1b2435]">Doctor Profile</p>
          <p className="mt-1 text-sm text-slate-600">Complete this once so patients can see your real name and specialty.</p>
        </div>

        {loading ? (
          <p className="text-sm text-slate-600">Loading profile...</p>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Full Name</span>
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Specialization</span>
              <select
                name="specialization"
                value={form.specialization}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">Select specialization</option>
                {doctorCategories.map((category) => (
                  <option key={category.id || category.name} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Consultation Fee</span>
              <input
                name="consultationFee"
                type="number"
                min="1"
                step="1"
                value={form.consultationFee}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>

            <label className="space-y-1 md:col-span-2">
              <span className="text-sm font-medium text-slate-700">Qualifications</span>
              <input
                name="qualifications"
                value={form.qualifications}
                onChange={handleChange}
                placeholder="MBBS, MD, etc."
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>

            <label className="space-y-1 md:col-span-2">
              <span className="text-sm font-medium text-slate-700">Bio</span>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows="4"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Years of Experience</span>
              <input
                name="yearsOfExperience"
                type="number"
                min="0"
                value={form.yearsOfExperience}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Phone</span>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>

            <div className="md:col-span-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
              {successMessage && <span className="text-sm text-emerald-700">{successMessage}</span>}
            </div>
          </form>
        )}

        {errorMessage && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {errorMessage}
          </div>
        )}
      </div>
    </DoctorPageLayout>
  )
}
