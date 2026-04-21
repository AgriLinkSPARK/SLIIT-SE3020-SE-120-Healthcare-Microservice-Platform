import axios from 'axios'
import { TELEMEDICINE_SERVICE_URL } from '../utils/constants'
import { getToken } from '../utils/tokenUtils'

const TELEMEDICINE_PATH = '/api/telemedicine/sessions'

const looksLikeUuid = (value) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)

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

const resolveTelemedicineBaseUrl = () => {
  const raw = `${TELEMEDICINE_SERVICE_URL || ''}`.trim()

  if (!raw || looksLikeUuid(raw)) {
    return TELEMEDICINE_PATH
  }

  const normalized = raw.replace(/\/+$/, '')

  if (normalized.startsWith('/')) {
    return normalized
  }

  if (/^https?:\/\//i.test(normalized)) {
    if (normalized.includes(TELEMEDICINE_PATH)) {
      return normalized
    }

    return `${normalized}${TELEMEDICINE_PATH}`
  }

  return TELEMEDICINE_PATH
}

const telemedicineApi = axios.create({
  baseURL: resolveTelemedicineBaseUrl(),
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