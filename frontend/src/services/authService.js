import api from './api'

export const login = async (payload) => {
  const { data } = await api.post('/auth/login', payload)
  return data
}

export const register = async (payload) => {
  const { data } = await api.post('/auth/register', payload)
  return data
}

export const getUserById = async (userId) => {
  const { data } = await api.get(`/auth/users/${userId}`)
  return data
}

export const getUsersByIds = async (userIds = []) => {
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return []
  }

  const results = await Promise.allSettled(userIds.map((userId) => getUserById(userId)))

  return results
    .filter((result) => result.status === 'fulfilled' && result.value)
    .map((result) => result.value)
}
