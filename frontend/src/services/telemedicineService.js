import axios from 'axios'
import { getToken } from '../utils/tokenUtils'

const normalizeMeetingUrl = (value) => {
  if (typeof value !== 'string') {
    return ''
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return ''
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  const roomName = trimmed
    .replace(/^\/+/, '')
    .replace(/^meet\.jit\.si\//i, '')

  if (!roomName) {
    return ''
  }

  return `https://meet.jit.si/${roomName}`
}

const telemedicineApi = axios.create({
  baseURL: '/api/telemedicine/sessions',
  timeout: 20000,
})

telemedicineApi.interceptors.request.use((config) => {
  const token = getToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export const getVideoSessionById = async (sessionId) => {
  const { data } = await telemedicineApi.get(`/${sessionId}`)
  return data
}

export const getVideoSessionByAppointmentId = async (appointmentId) => {
  const { data } = await telemedicineApi.get(`/appointment/${appointmentId}`)
  return data
}

export const createVideoSession = async (payload) => {
  const { data } = await telemedicineApi.post('', payload)
  return data
}

export const ensureVideoSessionForAppointment = async (appointmentId, payload) => {
  try {
    return await getVideoSessionByAppointmentId(appointmentId)
  } catch (error) {
    if (error.response?.status !== 404) {
      throw error
    }

    return createVideoSession(payload)
  }
}

export const getOrCreateVideoSessionForAppointment = ensureVideoSessionForAppointment

export const startVideoSession = async (sessionId, { userDisplayName, userEmail }) => {
  const { data } = await telemedicineApi.post(`/${sessionId}/start`, null, {
    params: { userDisplayName, userEmail },
  })

  if (typeof data === 'string') {
    return normalizeMeetingUrl(data)
  }

  if (data && typeof data === 'object') {
    return (
      normalizeMeetingUrl(data.jitsiMeetLink) ||
      normalizeMeetingUrl(data.meetingUrl) ||
      normalizeMeetingUrl(data.roomName) ||
      normalizeMeetingUrl(data.sessionId)
    )
  }

  return ''
}

export const endVideoSession = async (sessionId) => {
  const { data } = await telemedicineApi.post(`/${sessionId}/end`)
  return data
}

export const cancelVideoSession = async (sessionId, reason) => {
  const { data } = await telemedicineApi.put(`/${sessionId}/cancel`, null, {
    params: reason ? { reason } : undefined,
  })
  return data
}