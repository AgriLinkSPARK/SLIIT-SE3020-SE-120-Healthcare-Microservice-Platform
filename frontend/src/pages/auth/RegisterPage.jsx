import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import useAuth from '../../hooks/useAuth'
import Navbar from '../../components/common/Navbar'
import { getDoctorCategories } from '../../services/doctorService'
import { USER_ROLES } from '../../utils/constants'

const DASHBOARD_ROUTE_BY_ROLE = {
  [USER_ROLES.ADMIN]: '/admin/dashboard',
  [USER_ROLES.DOCTOR]: '/doctor/dashboard',
  [USER_ROLES.PATIENT]: '/patient/dashboard',
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, loading } = useAuth()
  const localBackgroundImage = '/auth-bg.jpg'
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'PATIENT',
    specialization: '',
  })
  const [doctorCategories, setDoctorCategories] = useState([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const loadDoctorCategories = async () => {
      try {
        const categories = await getDoctorCategories()
        setDoctorCategories(Array.isArray(categories) ? categories : [])
      } catch {
        setDoctorCategories([])
      }
    }

    loadDoctorCategories()
  }, [])

  const onChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => {
      if (name !== 'role') {
        return { ...prev, [name]: value }
      }

      if (value === 'DOCTOR') {
        const defaultCategory = doctorCategories[0]?.name || ''
        return {
          ...prev,
          role: value,
          specialization: prev.specialization || defaultCategory,
        }
      }

      return {
        ...prev,
        role: value,
        specialization: '',
      }
    })
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    try {
      const registeredUser = await register(form)
      setMessage('Registration successful. Redirecting...')
      const targetRoute = DASHBOARD_ROUTE_BY_ROLE[registeredUser?.role] || '/auth/login'
      setTimeout(() => navigate(targetRoute), 500)
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="relative min-h-screen bg-slate-100">
      <Navbar />
      <main
        className="flex min-h-screen items-center bg-cover bg-center px-4 py-12 sm:px-6 lg:px-8"
        style={{
          backgroundImage:
            "linear-gradient(80deg, rgba(236,244,255,0.95) 35%, rgba(236,244,255,0.68) 55%, rgba(236,244,255,0.22) 100%), url(" +
            localBackgroundImage +
            ')',
        }}
      >
        <div className="mx-auto w-full max-w-md rounded-2xl border border-white/70 bg-white/90 p-6 shadow-soft backdrop-blur sm:p-7">
          <h2 className="text-2xl font-extrabold text-brand-900">Register</h2>
          {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          {message && <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}
          <form onSubmit={onSubmit} className="mt-5 space-y-4">
            <label className="block space-y-1">
              <span className="text-sm font-semibold text-slate-700">Full Name</span>
              <input name="fullName" required value={form.fullName} onChange={onChange} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-semibold text-slate-700">Email</span>
              <input name="email" type="email" required value={form.email} onChange={onChange} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-semibold text-slate-700">Password</span>
              <input name="password" type="password" minLength={6} required value={form.password} onChange={onChange} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-semibold text-slate-700">Role</span>
              <select name="role" value={form.role} onChange={onChange} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100">
                <option value="PATIENT">Patient</option>
                <option value="DOCTOR">Doctor</option>
                <option value="ADMIN">Admin</option>
              </select>
            </label>

            {form.role === 'DOCTOR' && (
              <label className="block space-y-1">
                <span className="text-sm font-semibold text-slate-700">Doctor Specialization</span>
                <select
                  name="specialization"
                  value={form.specialization}
                  onChange={onChange}
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                >
                  <option value="">Select specialization</option>
                  {doctorCategories.map((category) => (
                    <option key={category.id || category.name} value={category.name}>
                      {category.description ? `${category.name} - ${category.description}` : category.name}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <button type="submit" disabled={loading} className="w-full rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70">
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
          <p className="mt-4 text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/auth/login" className="font-semibold text-brand-700 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
