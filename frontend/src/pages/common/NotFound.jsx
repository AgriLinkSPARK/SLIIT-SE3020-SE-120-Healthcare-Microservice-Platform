import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-100 p-6 text-center">
      <h1 className="text-5xl font-extrabold text-brand-900">404</h1>
      <p className="text-slate-700">Page not found.</p>
      <Link to="/auth/login" className="rounded-lg bg-brand-500 px-4 py-2 text-white">
        Go to Login
      </Link>
    </div>
  )
}
