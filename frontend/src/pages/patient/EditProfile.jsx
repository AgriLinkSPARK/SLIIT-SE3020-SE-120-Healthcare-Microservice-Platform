import { useState, useEffect } from 'react'
import { User, Mail, Phone, MapPin, Save, CheckCircle, Loader2 } from 'lucide-react'
import PatientPageLayout from '../../components/patient/PatientPageLayout'
import useAuth from '../../hooks/useAuth'
import { getPatientByUserId, updatePatientProfile } from '../../services/patientService'

export default function EditProfile() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  })

  const [patientId, setPatientId] = useState(null)

  // Load user data on mount
  useEffect(() => {
    const fetchPatientProfile = async () => {
      if (user?.userId) {
        setIsLoading(true)
        try {
          const patient = await getPatientByUserId(user.userId)
          setPatientId(patient.id)
          setFormData({
            name: `${patient.firstName} ${patient.lastName}`.trim(),
            email: patient.email || '',
            phone: patient.phone || '',
            address: patient.address || '',
          })
        } catch (error) {
          console.error('Failed to fetch patient profile:', error)
          // Fallback to auth user data if patient service fetch fails
          setFormData({
            name: user.fullName || user.name || user.firstName || '',
            email: user.email || user.user?.email || '',
            phone: user.phone || user.user?.phone || '',
            address: user.address || user.user?.address || '',
          })
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchPatientProfile()
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear messages when user starts typing
    setSuccessMessage('')
    setErrorMessage('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      const nameParts = formData.name.trim().split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      const profileData = {
        firstName,
        lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      }

      if (patientId) {
        await updatePatientProfile(patientId, profileData)
      } else {
        // Fallback to userId if patientId is not yet loaded
        await updatePatientProfile(user.userId, profileData)
      }
      
      // Update local storage with new data to keep UI consistent
      const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
      const updatedUser = {
        ...storedUser,
        fullName: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      }
      localStorage.setItem('currentUser', JSON.stringify(updatedUser))
      
      setSuccessMessage('Profile updated successfully!')
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const inputClasses = "w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"

  return (
    <PatientPageLayout
      title="Edit Profile"
      subtitle="Update your personal information"
    >
      <div className="max-w-2xl">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <p className="text-sm font-medium text-emerald-800">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 rounded-xl bg-rose-50 border border-rose-200 p-4 flex items-center gap-3">
            <div className="h-5 w-5 rounded-full bg-rose-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <p className="text-sm font-medium text-rose-800">{errorMessage}</p>
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Personal Information</h2>
                <p className="text-sm text-slate-500">Manage your account details</p>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="p-6 space-y-5">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={inputClasses}
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  className={inputClasses}
                  required
                />
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className={inputClasses}
                />
              </div>
            </div>

            {/* Address Field */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-2">
                Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your address"
                  rows={3}
                  className={`${inputClasses} py-3 resize-none`}
                />
              </div>
            </div>
          </div>

          {/* Footer / Submit */}
          <div className="px-6 py-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>

        {/* Additional Info Card */}
        <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
          <h3 className="text-sm font-medium text-blue-900 mb-1">Note</h3>
          <p className="text-sm text-blue-700">
            Your profile information is used for appointment bookings and communication. 
            Make sure your contact details are up to date.
          </p>
        </div>
      </div>
    </PatientPageLayout>
  )
}
