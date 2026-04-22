import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from '../components/common/ProtectedRoute'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import DoctorDashboard from '../pages/doctor/DoctorDashboard'
import ProfilePage from '../pages/doctor/ProfilePage'
import AvailabilityPage from '../pages/doctor/AvailabilityPage'
import AppointmentsPage from '../pages/doctor/AppointmentsPage'
import PatientsPage from '../pages/doctor/PatientsPage'
import ReportsPage from '../pages/doctor/ReportsPage'
import PrescriptionsPage from '../pages/doctor/PrescriptionsPage'
import PatientDashboard from '../pages/patient/PatientDashboard'
import BrowseDoctorsPage from '../pages/patient/BrowseDoctorsPage'
import BookAppointmentPage from '../pages/patient/BookAppointmentPage'
import MyAppointments from '../pages/patient/MyAppointments'
import PatientReportsPage from '../pages/patient/ReportsPage'
import PaymentsPage from '../pages/patient/PaymentsPage'
import EditProfile from '../pages/patient/EditProfile'
import UploadReports from '../pages/patient/UploadReports'
import VideoConsultationPage from '../pages/telemedicine/VideoConsultationPage'
import AdminDashboard from '../pages/admin/AdminDashboard'
import ManageUsersPage from '../pages/admin/ManageUsersPage'
import NotFound from '../pages/common/NotFound'
import { USER_ROLES } from '../utils/constants'
import useAuth from '../hooks/useAuth'

function AppointmentsRouter() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/auth/login" replace />
  if (user.role === USER_ROLES.DOCTOR) return <Navigate to="/doctor/appointments" replace />
  if (user.role === USER_ROLES.PATIENT) return <Navigate to="/patient/appointments" replace />
  return <Navigate to="/patient/appointments" replace />
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth/login" replace />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />

      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.DOCTOR]}>
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/doctor/profile" element={<ProtectedRoute allowedRoles={[USER_ROLES.DOCTOR]}><ProfilePage /></ProtectedRoute>} />
      <Route path="/doctor/availability" element={<ProtectedRoute allowedRoles={[USER_ROLES.DOCTOR]}><AvailabilityPage /></ProtectedRoute>} />
      <Route path="/doctor/appointments" element={<ProtectedRoute allowedRoles={[USER_ROLES.DOCTOR]}><AppointmentsPage /></ProtectedRoute>} />
      <Route path="/doctor/patients" element={<ProtectedRoute allowedRoles={[USER_ROLES.DOCTOR]}><PatientsPage /></ProtectedRoute>} />
      <Route path="/doctor/reports" element={<ProtectedRoute allowedRoles={[USER_ROLES.DOCTOR]}><ReportsPage /></ProtectedRoute>} />
      <Route path="/doctor/prescriptions" element={<ProtectedRoute allowedRoles={[USER_ROLES.DOCTOR]}><PrescriptionsPage /></ProtectedRoute>} />

      <Route path="/patient/dashboard" element={<ProtectedRoute allowedRoles={[USER_ROLES.PATIENT]}><PatientDashboard /></ProtectedRoute>} />
      <Route path="/patient/doctors" element={<ProtectedRoute allowedRoles={[USER_ROLES.PATIENT]}><BrowseDoctorsPage /></ProtectedRoute>} />
      <Route path="/patient/book" element={<ProtectedRoute allowedRoles={[USER_ROLES.PATIENT]}><BookAppointmentPage /></ProtectedRoute>} />
      <Route path="/appointments" element={<ProtectedRoute allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.DOCTOR, USER_ROLES.PATIENT]}><AppointmentsRouter /></ProtectedRoute>} />
      <Route path="/patient/appointments" element={<ProtectedRoute allowedRoles={[USER_ROLES.PATIENT]}><MyAppointments /></ProtectedRoute>} />
      <Route path="/patient/payments" element={<ProtectedRoute allowedRoles={[USER_ROLES.PATIENT]}><PaymentsPage /></ProtectedRoute>} />
      <Route path="/patient/reports" element={<ProtectedRoute allowedRoles={[USER_ROLES.PATIENT]}><PatientReportsPage /></ProtectedRoute>} />
      <Route path="/patient/profile" element={<ProtectedRoute allowedRoles={[USER_ROLES.PATIENT]}><EditProfile /></ProtectedRoute>} />
      <Route path="/patient/upload-reports" element={<ProtectedRoute allowedRoles={[USER_ROLES.PATIENT]}><UploadReports /></ProtectedRoute>} />

      <Route
        path="/telemedicine/sessions/:sessionId"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.DOCTOR, USER_ROLES.PATIENT]}>
            <VideoConsultationPage />
          </ProtectedRoute>
        }
      />

      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}><ManageUsersPage /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
