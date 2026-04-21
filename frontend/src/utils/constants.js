export const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8081/api'
export const TELEMEDICINE_SERVICE_URL = import.meta.env.VITE_TELEMEDICINE_SERVICE_URL || '/api/telemedicine/sessions'

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  DOCTOR: 'DOCTOR',
  PATIENT: 'PATIENT',
}

export const TOKEN_KEY = 'authToken'
export const USER_KEY = 'currentUser'
