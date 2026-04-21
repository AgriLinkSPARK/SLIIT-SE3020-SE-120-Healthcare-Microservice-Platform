import { TOKEN_KEY, USER_KEY } from './constants'

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export const setToken = (token) => {
  if (!token) return
  localStorage.setItem(TOKEN_KEY, token)
}

export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem(USER_KEY)
    return userStr ? JSON.parse(userStr) : null
  } catch {
    return null
  }
}
