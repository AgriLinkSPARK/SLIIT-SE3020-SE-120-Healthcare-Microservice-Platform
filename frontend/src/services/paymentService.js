import api from './api'

export const getAllPayments = async (status) => {
  const { data } = await api.get('/payments', {
    params: status ? { status } : undefined,
  })
  return data
}

export const getPaymentsByPatient = async (patientId, status) => {
  const path = status ? `/payments/history/${patientId}` : `/payments/patient/${patientId}`
  const { data } = await api.get(path, {
    params: status ? { status } : undefined,
  })
  return data
}
