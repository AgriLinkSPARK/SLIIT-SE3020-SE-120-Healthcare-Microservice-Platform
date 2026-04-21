# Postman API List - All Services

This file lists API endpoints for all services defined in docker-compose.

## Services Overview

| Service | Port | API Availability |
|---|---:|---|
| mongodb | 27017 | No REST API (MongoDB database service) |
| payment-service | 8004 | REST API available |
| appointment-service | 8002 | REST API available |
| auth-service | 8081 | REST API available |
| doctor-service | 8083 | REST API available |
| frontend | 3000 | No backend REST API (UI only) |
| telemedicine-service | 8085 | REST API available |

## payment-service (http://localhost:8004)

### Core Payment APIs
- GET /api/v1/payments
- POST /api/v1/payments/initiate
- POST /api/v1/payments/{paymentId}/confirm
- GET /api/v1/payments/{paymentId}
- GET /api/v1/payments/patient/{patientId}
- GET /api/v1/payments/doctor/{doctorId}
- GET /api/v1/payments/consultation/{consultationId}
- POST /api/v1/payments/{paymentId}/refund
- GET /api/v1/payments/history/{patientId}
- GET /api/v1/payments/health
- GET /

### Webhook APIs
- POST /api/v1/webhooks/stripe
- GET /api/v1/webhooks/health
- POST /api/v1/webhooks/payhere/notify
- GET /api/v1/webhooks/payhere/notify
- GET /api/v1/webhooks/payhere/return
- GET /api/v1/webhooks/payhere/cancel

## appointment-service (http://localhost:8002)

- GET /api/v1/appointments/health
- GET /api/v1/appointments
- GET /api/v1/appointments/doctors/search
- GET /api/v1/appointments/search
- POST /api/v1/appointments
- GET /api/v1/appointments/patient/{patientId}
- GET /api/v1/appointments/doctor/{doctorId}
- GET /api/v1/appointments/{appointmentId}
- PUT /api/v1/appointments/{appointmentId}
- PATCH /api/v1/appointments/{appointmentId}/cancel
- PATCH /api/v1/appointments/{appointmentId}/status
- GET /api/v1/appointments/{appointmentId}/status

## auth-service (http://localhost:8081)

### Auth APIs
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- GET /api/auth/users/{userId}
- GET /api/auth/users

### Admin APIs
- GET /api/admin/users
- POST /api/admin/doctors/{userId}/verify
- PUT /api/admin/users/{userId}/role

## doctor-service (http://localhost:8083)

### Public APIs
- GET /api/doctor/public/categories
- GET /api/doctor/public/booking-options

### Doctor APIs
- POST /api/doctor/profile
- GET /api/doctor/profile
- POST /api/doctor/availability
- GET /api/doctor/availability
- PUT /api/doctor/availability/{slotId}
- DELETE /api/doctor/availability/{slotId}
- POST /api/doctor/appointments/requests
- GET /api/doctor/appointments/requests
- POST /api/doctor/appointments/requests/{requestId}/accept
- POST /api/doctor/appointments/requests/{requestId}/reject
- POST /api/doctor/consultations
- GET /api/doctor/consultations
- POST /api/doctor/consultations/{consultationId}/start
- POST /api/doctor/consultations/{consultationId}/complete
- POST /api/doctor/prescriptions
- GET /api/doctor/prescriptions
- GET /api/doctor/patient-reports/{patientId}

## telemedicine-service (http://localhost:8085)

- GET /actuator/health
- POST /api/telemedicine/sessions
- GET /api/telemedicine/sessions/{sessionId}
- POST /api/telemedicine/sessions/{sessionId}/start
- POST /api/telemedicine/sessions/{sessionId}/end
- PUT /api/telemedicine/sessions/{sessionId}/cancel
- GET /api/telemedicine/sessions/my-sessions
- GET /api/telemedicine/sessions
- GET /api/telemedicine/sessions/upcoming
- GET /api/telemedicine/sessions/doctor/{doctorId}
- GET /api/telemedicine/sessions/patient/{patientId}

## Postman Collection Files Found

- services/doctor-service/doctor-service.postman_collection.json
- services/telemedicine-service/postman/telemedicine-service.postman_collection.json

## Notes

- mongodb and frontend are included as system services but do not expose REST endpoints for Postman API testing.
- This list is compiled from controller mappings and available Postman collection files.