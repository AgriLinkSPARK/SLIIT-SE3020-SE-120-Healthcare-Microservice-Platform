import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import useAuth from '../../hooks/useAuth'
import Navbar from '../../components/common/Navbar'
import { USER_ROLES } from '../../utils/constants'

const DASHBOARD_ROUTE_BY_ROLE = {
  [USER_ROLES.ADMIN]: '/admin/dashboard',
  [USER_ROLES.DOCTOR]: '/doctor/dashboard',
  [USER_ROLES.PATIENT]: '/patient/dashboard',
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, loading } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const localBackgroundImage = '/auth-bg.jpg'

  const onChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    try {
      const authenticatedUser = await login(form)
      setIsLoginOpen(false)
      const targetRoute = DASHBOARD_ROUTE_BY_ROLE[authenticatedUser?.role] || '/auth/login'
      navigate(targetRoute)
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed')
    }
  }

  const openLoginPopup = () => {
    setError('')
    setIsLoginOpen(true)
  }

  const closeLoginPopup = () => {
    setIsLoginOpen(false)
  }

  return (
    <div className="relative min-h-screen bg-slate-100">
      <Navbar onLoginClick={openLoginPopup} />
      <main
        className="hero-bg flex min-h-screen items-center bg-cover bg-center px-4 py-12 sm:px-6 lg:px-8"
        style={{
          backgroundImage:
            "linear-gradient(80deg, rgba(226,238,252,0.72) 32%, rgba(210,229,248,0.30) 56%, rgba(199,224,246,0.04) 100%), url(" +
            localBackgroundImage +
            ")",
        }}
      >
        <div className="mx-auto w-full max-w-7xl">
          <section className="self-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-brand-900 sm:text-5xl">Welcome to HealthCheck</h1>
            <p className="mt-3 max-w-md text-slate-700">Manage appointments, consult doctors, and access medical records in one place.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={openLoginPopup}
                className="inline-block rounded-full bg-brand-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-700"
              >
                Login
              </button>
              <Link to="/auth/register" className="inline-block rounded-full border border-brand-500 bg-white/90 px-6 py-2.5 text-sm font-bold text-brand-700 hover:bg-brand-50">
                Create Account
              </Link>
            </div>
          </section>
        </div>
      </main>

      {isLoginOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/45 p-4" onClick={closeLoginPopup}>
          <section
            className="w-full max-w-xl rounded-2xl border border-white/70 bg-white p-6 shadow-soft sm:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-brand-900">Login</h2>
              <button
                type="button"
                onClick={closeLoginPopup}
                className="rounded-full border border-slate-200 px-2.5 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <form onSubmit={onSubmit} className="mt-5 space-y-4">
              <label className="block space-y-1">
                <span className="text-sm font-semibold text-slate-700">Email</span>
                <input name="email" type="email" required value={form.email} onChange={onChange} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-semibold text-slate-700">Password</span>
                <input name="password" type="password" required value={form.password} onChange={onChange} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
              </label>
              <button type="submit" disabled={loading} className="w-full rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70">
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}
