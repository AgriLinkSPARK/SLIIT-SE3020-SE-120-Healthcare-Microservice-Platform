import axios from 'axios'
import { PATIENT_SERVICE_URL } from '../utils/constants'
import { getToken } from '../utils/tokenUtils'

// Create a dedicated axios instance for patient-service
const patientApi = axios.create({
  baseURL: `${PATIENT_SERVICE_URL}/api`,
})

// Add auth token interceptor
patientApi.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const getPatientDashboard = async () => {
  const { data } = await patientApi.get('/patient/dashboard')
  return data.data
}

export const getPatientByUserId = async (userId) => {
  const { data } = await patientApi.get(`/patients/user/${userId}`)
  return data.data
}

export const updatePatientProfile = async (id, profileData) => {
  const { data } = await patientApi.put(`/patients/${id}`, profileData)
  return data.data
}

export const uploadMedicalReport = async (id, formData, onProgress) => {
  const { data } = await patientApi.post(`/patients/${id}/upload-report`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(progress)
      }
    },
  })
  return data.data
}

export const getMedicalReports = async (id) => {
  const { data } = await patientApi.get(`/patients/${id}/reports`)
  return data.data
}

export const deleteMedicalReport = async (id, reportId) => {
  const { data } = await patientApi.delete(`/patients/${id}/reports/${reportId}`)
  return data.data
}

export const downloadReport = (fileName) => {
  const token = getToken()
  const url = `${PATIENT_SERVICE_URL}/api/patients/reports/download/${fileName}${token ? `?token=${token}` : ''}`
  window.open(url, '_blank')
}
