import { Link } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

export default function Navbar({ onLoginClick }) {
  const { isAuthenticated, logout } = useAuth()

  return (
    <header className="absolute left-0 right-0 top-0 z-20">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-10">
        <Link to="/" className="text-2xl font-extrabold tracking-tight text-brand-900">
          HealthCheck
        </Link>
        <nav className="flex items-center gap-2">
          {onLoginClick ? (
            <button
              type="button"
              onClick={onLoginClick}
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white/70"
            >
              Login
            </button>
          ) : (
            <Link to="/auth/login" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white/70">
              Login
            </Link>
          )}
          <Link to="/auth/register" className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
            Register
          </Link>
          {isAuthenticated && (
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}
