import { Navigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { USER_ROLES } from '../../utils/constants'

const DASHBOARD_ROUTE_BY_ROLE = {
  [USER_ROLES.ADMIN]: '/admin/dashboard',
  [USER_ROLES.DOCTOR]: '/doctor/dashboard',
  [USER_ROLES.PATIENT]: '/patient/dashboard',
}

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    const redirectRoute = DASHBOARD_ROUTE_BY_ROLE[user?.role] || '/auth/login'
    return <Navigate to={redirectRoute} replace />
  }

  return children
}
