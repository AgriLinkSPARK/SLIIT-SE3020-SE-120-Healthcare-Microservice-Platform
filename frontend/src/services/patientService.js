import api from './api'
import axios from 'axios'
import { getPatientServiceApiBaseUrl } from '../utils/constants'
import { getToken } from '../utils/tokenUtils'

// ==================== EXISTING FUNCTIONALITY ====================
// Keep the original dashboard call via the shared api gateway
export const getPatientDashboard = async () => {
  const { data } = await api.get('/patient/dashboard')
  return data
}

// ==================== PATIENT SERVICE ====================

// Helper to extract data from ApiResponse wrapper
const extractData = (response) => response.data?.data || response.data

const patientApi = axios.create({
  baseURL: getPatientServiceApiBaseUrl(),
})

patientApi.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` }
  return config
})

// ==================== PATIENT PROFILE ====================

export const registerPatient = async (patientData) => {
  const { data } = await patientApi.post('/patients/register', patientData)
  return extractData(data)
}

export const getPatientProfile = async (id) => {
  const { data } = await patientApi.get(`/patients/${id}`)
  return extractData(data)
}

export const updatePatientProfile = async (id, profileData) => {
  const { data } = await patientApi.put(`/patients/${id}`, profileData)
  return extractData(data)
}

// ==================== MEDICAL REPORTS ====================

export const uploadMedicalReport = async (id, formData) => {
  const { data } = await patientApi.post(`/patients/${id}/upload-report`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return extractData(data)
}

export const getMedicalReports = async (id) => {
  const { data } = await patientApi.get(`/patients/${id}/reports`)
  return extractData(data)
}

export const deleteMedicalReport = async (patientId, reportId) => {
  const { data } = await patientApi.delete(`/patients/${patientId}/reports/${reportId}`)
  return extractData(data)
}

// ==================== APPOINTMENTS ====================

export const getPatientAppointments = async (patientId) => {
  const { data } = await patientApi.get(`/patients/${patientId}/appointments`)
  return extractData(data)
}

export const getUpcomingAppointments = async (patientId) => {
  const { data } = await patientApi.get(`/patients/${patientId}/appointments/upcoming`)
  return extractData(data)
}

export const getAppointmentById = async (patientId, appointmentId) => {
  const { data } = await patientApi.get(`/patients/${patientId}/appointments/${appointmentId}`)
  return extractData(data)
}

export const bookAppointmentViaPatientService = async (patientId, appointmentData) => {
  const { data } = await patientApi.post(`/patients/${patientId}/appointments`, appointmentData)
  return extractData(data)
}

export const updateAppointment = async (patientId, appointmentId, appointmentData) => {
  const { data } = await patientApi.put(`/patients/${patientId}/appointments/${appointmentId}`, appointmentData)
  return extractData(data)
}

export const cancelAppointmentViaPatientService = async (patientId, appointmentId) => {
  const { data } = await patientApi.put(`/patients/${patientId}/appointments/${appointmentId}/cancel`)
  return extractData(data)
}

export const deleteAppointment = async (patientId, appointmentId) => {
  const { data } = await patientApi.delete(`/patients/${patientId}/appointments/${appointmentId}`)
  return extractData(data)
}

// ==================== PRESCRIPTIONS ====================

export const getPatientPrescriptions = async (patientId) => {
  const { data } = await patientApi.get(`/patients/${patientId}/prescriptions`)
  return extractData(data)
}

export const getPrescriptionById = async (patientId, prescriptionId) => {
  const { data } = await patientApi.get(`/patients/${patientId}/prescriptions/${prescriptionId}`)
  return extractData(data)
}

export const getPrescriptionsByAppointment = async (patientId, appointmentId) => {
  const { data } = await patientApi.get(`/patients/${patientId}/prescriptions/by-appointment/${appointmentId}`)
  return extractData(data)
}

// ==================== MEDICAL RECORDS ====================

export const getMedicalRecords = async (patientId) => {
  const { data } = await patientApi.get(`/patients/${patientId}/records`)
  return extractData(data)
}

export const uploadMedicalRecord = async (patientId, recordData) => {
  const { data } = await patientApi.post(`/patients/${patientId}/records`, recordData)
  return extractData(data)
}

export const deleteMedicalRecord = async (patientId, recordId) => {
  const { data } = await patientApi.delete(`/patients/${patientId}/records/${recordId}`)
  return extractData(data)
}

// ==================== DOCTORS (via patient-service proxy) ====================

export const getAllDoctors = async () => {
  const { data } = await patientApi.get('/doctors')
  return extractData(data)
}

export const searchDoctors = async (query, filters = {}) => {
  const params = new URLSearchParams({ q: query, ...filters })
  const { data } = await patientApi.get(`/doctors/search?${params}`)
  return extractData(data)
}

export const getDoctorById = async (doctorId) => {
  const { data } = await patientApi.get(`/doctors/${doctorId}`)
  return extractData(data)
}

export const getDoctorAvailability = async (doctorId) => {
  const { data } = await patientApi.get(`/doctors/${doctorId}/availability`)
  return extractData(data)
}
