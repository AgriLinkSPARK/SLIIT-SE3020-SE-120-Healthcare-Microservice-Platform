import axios from 'axios'
import { getToken } from '../utils/tokenUtils'

const DOCTOR_PATH = '/api/doctor'

const looksLikeUuid = (value) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)

const resolveDoctorBaseUrl = () => {
  const raw = `${import.meta.env.VITE_DOCTOR_SERVICE_URL || ''}`.trim()

  if (!raw || looksLikeUuid(raw)) {
    return 'http://localhost:8083'
  }

  const normalized = raw.replace(/\/+$/, '')

  if (/^https?:\/\//i.test(normalized)) {
    return normalized
  }

  if (normalized.startsWith('/')) {
    return normalized
  }

  return 'http://localhost:8083'
}

const doctorApi = axios.create({
  baseURL: resolveDoctorBaseUrl(),
  timeout: 15000,
})

doctorApi.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const getDoctorProfile = async () => {
  try {
    const { data } = await doctorApi.get(`${DOCTOR_PATH}/profile`)
    return data || null
  } catch (error) {
    if (error.response?.status === 404 || error.response?.status === 204) {
      return null
    }
    throw error
  }
}

export const upsertDoctorProfile = async (payload) => {
  const { data } = await doctorApi.post(`${DOCTOR_PATH}/profile`, payload)
  return data
}

export const getDoctorBookingOptions = async (filters = {}) => {
  const { data } = await doctorApi.get(`${DOCTOR_PATH}/public/booking-options`, {
    params: filters,
  })
  return data
}

export const getDoctorCategories = async () => {
  const { data } = await doctorApi.get(`${DOCTOR_PATH}/public/categories`)
  return data
}

export const getDoctorAvailability = async () => {
  const { data } = await doctorApi.get(`${DOCTOR_PATH}/availability`)
  return data
}

export const createDoctorAvailability = async (payload) => {
  const { data } = await doctorApi.post(`${DOCTOR_PATH}/availability`, payload)
  return data
}

export const updateDoctorAvailability = async (slotId, payload) => {
  const { data } = await doctorApi.put(`${DOCTOR_PATH}/availability/${slotId}`, payload)
  return data
}

export const deleteDoctorAvailability = async (slotId) => {
  await doctorApi.delete(`${DOCTOR_PATH}/availability/${slotId}`)
}

export const getDoctorConsultations = async () => {
  const { data } = await doctorApi.get(`${DOCTOR_PATH}/consultations`)
  return data
}

export const getDoctorPrescriptions = async (patientId = '') => {
  const { data } = await doctorApi.get(`${DOCTOR_PATH}/prescriptions`, {
    params: patientId ? { patientId } : undefined,
  })
  return data
}

export const issueDoctorPrescription = async (payload) => {
  const { data } = await doctorApi.post(`${DOCTOR_PATH}/prescriptions`, payload)
  return data
}
