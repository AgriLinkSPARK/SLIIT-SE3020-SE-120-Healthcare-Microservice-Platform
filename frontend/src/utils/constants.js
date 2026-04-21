export const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || '/api'
export const TELEMEDICINE_SERVICE_URL = import.meta.env.VITE_TELEMEDICINE_SERVICE_URL || '/api/telemedicine/sessions'
export const PATIENT_SERVICE_URL = import.meta.env.VITE_PATIENT_SERVICE_URL || '/api'

export const getPatientServiceApiBaseUrl = () => {
  if (PATIENT_SERVICE_URL.startsWith('http://') || PATIENT_SERVICE_URL.startsWith('https://')) {
    return `${PATIENT_SERVICE_URL}/api`
  }

  return PATIENT_SERVICE_URL
}

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  DOCTOR: 'DOCTOR',
  PATIENT: 'PATIENT',
}

export const TOKEN_KEY = 'authToken'
export const USER_KEY = 'currentUser'
