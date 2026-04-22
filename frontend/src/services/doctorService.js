import axios from 'axios'
import { getToken } from '../utils/tokenUtils'


const doctorApi = axios.create({
  baseURL: '/api/doctor',
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
    const { data } = await doctorApi.get('/profile')
    return data || null
  } catch (error) {
    if (error.response?.status === 404 || error.response?.status === 204) {
      return null
    }
    throw error
  }
}

export const upsertDoctorProfile = async (payload) => {
  const { data } = await doctorApi.post('/profile', payload)
  return data
}

export const getDoctorBookingOptions = async (filters = {}) => {
  const { data } = await doctorApi.get('/public/booking-options', {
    params: filters,
  })
  return data
}

export const getDoctorCategories = async () => {
  const { data } = await doctorApi.get('/public/categories')
  return data
}

export const getDoctorAvailability = async () => {
  const { data } = await doctorApi.get('/availability')
  return data
}

export const createDoctorAvailability = async (payload) => {
  const { data } = await doctorApi.post('/availability', payload)
  return data
}

export const updateDoctorAvailability = async (slotId, payload) => {
  const { data } = await doctorApi.put(`/availability/${slotId}`, payload)
  return data
}

export const deleteDoctorAvailability = async (slotId) => {
  await doctorApi.delete(`/availability/${slotId}`)
}

export const getDoctorConsultations = async () => {
  const { data } = await doctorApi.get('/consultations')
  return data
}

export const getDoctorPrescriptions = async (patientId = '') => {
  const { data } = await doctorApi.get('/prescriptions', {
    params: patientId ? { patientId } : undefined,
  })
  return data
}

export const issueDoctorPrescription = async (payload) => {
  const { data } = await doctorApi.post('/prescriptions', payload)
  return data
}

export const getDoctorPatientReports = async (patientId) => {
  const { data } = await doctorApi.get(`/patient-reports/${patientId}`)
  return data
}
