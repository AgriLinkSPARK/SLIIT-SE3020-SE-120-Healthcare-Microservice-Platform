import { createContext, useMemo, useState } from 'react'
import { login as loginRequest, register as registerRequest } from '../services/authService'
import { upsertDoctorProfile } from '../services/doctorService'
import { TOKEN_KEY, USER_KEY } from '../utils/constants'
import { clearToken, setToken } from '../utils/tokenUtils'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  })
  const [loading, setLoading] = useState(false)

  const login = async (credentials) => {
    setLoading(true)
    try {
      const data = await loginRequest(credentials)
      if (data?.token) {
        setToken(data.token)
      }
      localStorage.setItem(USER_KEY, JSON.stringify(data))
      setUser(data)
      return data
    } finally {
      setLoading(false)
    }
  }

  const register = async (payload) => {
    setLoading(true)
    try {
      const data = await registerRequest(payload)
      if (data?.token) {
        setToken(data.token)
      }

      if (payload?.role === 'DOCTOR' && payload?.specialization) {
        try {
          await upsertDoctorProfile({
            fullName: payload.fullName,
            email: payload.email,
            specialization: data?.specialization || payload.specialization,
            qualifications: payload.qualifications || 'To be updated',
            bio: payload.bio || '',
            yearsOfExperience: Number(payload.yearsOfExperience || 0),
            consultationFee: Number(payload.consultationFee || 1),
            phone: payload.phone || '',
          })
        } catch {
          // Profile sync is best-effort; registration should still succeed.
        }
      }

      localStorage.setItem(USER_KEY, JSON.stringify(data))
      setUser(data)
      return data
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    clearToken()
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }

  const value = useMemo(
    () => ({ user, loading, isAuthenticated: Boolean(user), login, register, logout }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
