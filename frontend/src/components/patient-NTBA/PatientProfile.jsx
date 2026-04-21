import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, User, Mail, Phone, Calendar, MapPin } from 'lucide-react'
import Loader from '../../components/common/Loader'
import { getPatientProfile, updatePatientProfile } from '../../services/patientService'
import { getCurrentUser } from '../../utils/tokenUtils'

export default function PatientProfile() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formErrors, setFormErrors] = useState({})

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
  })

  const currentUser = getCurrentUser()
  const patientId = currentUser?.id

  useEffect(() => {
    const fetchProfile = async () => {
      if (!patientId) {
        setError('User not authenticated')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')
        const profile = await getPatientProfile(patientId)

        setFormData({
          firstName: profile?.firstName || '',
          lastName: profile?.lastName || '',
          email: profile?.email || '',
          phone: profile?.phone || '',
          dateOfBirth: profile?.dateOfBirth || '',
          gender: profile?.gender || '',
          address: profile?.address || '',
        })
      } catch (err) {
        setError('Failed to load profile. Please try again.')
        console.error('Profile error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [patientId])

  const validateForm = () => {
    const errors = {}

    if (!formData.firstName?.trim()) {
      errors.firstName = 'First name is required'
    }

    if (!formData.lastName?.trim()) {
      errors.lastName = 'Last name is required'
    }

    if (!formData.email?.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccess('')

    if (!validateForm()) {
      return
    }

    try {
      setSaving(true)
      setError('')
      await updatePatientProfile(patientId, formData)
      setSuccess('Profile updated successfully!')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const inputClasses = (error) =>
    `rounded-lg border ${
      error ? 'border-red-300' : 'border-slate-200'
    } bg-white px-4 py-2 text-sm w-full focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500`

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
        <Loader />
      </div>
    )
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

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="mb-6 text-2xl font-semibold text-slate-800">My Profile</h1>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <User className="h-4 w-4" />
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={inputClasses(formErrors.firstName)}
                  placeholder="Enter your first name"
                />
                {formErrors.firstName && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.firstName}</p>
                )}
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <User className="h-4 w-4" />
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={inputClasses(formErrors.lastName)}
                  placeholder="Enter your last name"
                />
                {formErrors.lastName && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.lastName}</p>
                )}
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Mail className="h-4 w-4" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClasses(formErrors.email)}
                  placeholder="Enter your email"
                />
                {formErrors.email && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={inputClasses(formErrors.phone)}
                  placeholder="Enter your phone number"
                />
                {formErrors.phone && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.phone}</p>
                )}
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Calendar className="h-4 w-4" />
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className={inputClasses(formErrors.dateOfBirth)}
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <User className="h-4 w-4" />
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={inputClasses(formErrors.gender)}
                >
                  <option value="">Select gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                  <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                <MapPin className="h-4 w-4" />
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className={inputClasses(formErrors.address)}
                placeholder="Enter your full address"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/patient/dashboard')}
                className="rounded-lg border border-slate-200 px-6 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-full bg-brand-500 px-6 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
