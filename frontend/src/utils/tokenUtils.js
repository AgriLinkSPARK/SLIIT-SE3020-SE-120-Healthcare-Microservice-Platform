import { TOKEN_KEY } from './constants'

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export const setToken = (token) => {
  if (!token) return
  localStorage.setItem(TOKEN_KEY, token)
}

export const clearToken = () => localStorage.removeItem(TOKEN_KEY)
