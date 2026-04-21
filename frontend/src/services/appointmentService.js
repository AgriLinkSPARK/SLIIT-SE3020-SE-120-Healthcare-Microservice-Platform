import axios from 'axios'

const appointmentApi = axios.create({
  baseURL: import.meta.env.VITE_APPOINTMENT_SERVICE_URL || 'http://localhost:8002/api/v1/appointments',
  timeout: 15000,
})

export const searchDoctorsBySpecialty = async (specialty) => {
  const { data } = await appointmentApi.get('/doctors/search', {
    params: specialty ? { specialty } : undefined,
  })
  return data
}

export const bookAppointment = async (payload) => {
  const { data } = await appointmentApi.post('', payload)
  return data
}

export const getAppointmentsByPatient = async (patientId) => {
  const { data } = await appointmentApi.get(`/patient/${patientId}`)
  return data
}

export const getAppointmentsByDoctor = async (doctorId) => {
  const { data } = await appointmentApi.get(`/doctor/${doctorId}`)
  return data
}

export const getAllAppointments = async (filters = {}) => {
  const { data } = await appointmentApi.get('', {
    params: filters,
  })
  return data
}

export const updateAppointment = async (appointmentId, payload) => {
  const { data } = await appointmentApi.put(`/${appointmentId}`, payload)
  return data
}

export const cancelAppointment = async (appointmentId) => {
  const { data } = await appointmentApi.patch(`/${appointmentId}/cancel`)
  return data
}

export const getAppointmentStatus = async (appointmentId) => {
  const { data } = await appointmentApi.get(`/${appointmentId}/status`)
  return data
}
