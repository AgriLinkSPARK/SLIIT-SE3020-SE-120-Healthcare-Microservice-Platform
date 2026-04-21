import api from './api'

export const getPatientDashboard = async () => {
  const { data } = await api.get('/patient/dashboard')
  return data
}
