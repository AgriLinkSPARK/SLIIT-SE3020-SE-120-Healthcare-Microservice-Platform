import { Calendar, FileText, Home, Pill, Stethoscope, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import useAuth from '../../hooks/useAuth';

export default function DoctorPageLayout({ activeLabel, title, children }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuItems = [
    { icon: Home, label: 'Overview', path: '/doctor/dashboard' },
    { icon: Calendar, label: 'Appointments', path: '/doctor/appointments' },
    { icon: Stethoscope, label: 'Schedule', path: '/doctor/availability' },
    { icon: Users, label: 'Patients', path: '/doctor/patients' },
    { icon: FileText, label: 'Reports', path: '/doctor/reports' },
    { icon: Pill, label: 'Prescriptions', path: '/doctor/prescriptions' },
  ].map((item) => ({
    ...item,
    onClick: () => navigate(item.path),
  }));

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen bg-[#eff2f7] overflow-hidden">
      <div className="flex min-h-screen w-full gap-0">
        <Sidebar brand="HealthCheck" menuItems={menuItems} activeLabel={activeLabel} />

        <main className="flex min-h-screen flex-1 flex-col overflow-hidden bg-white">
          <header className="relative border-b border-[#e8ecf4] bg-[#f9fbff] px-5 pb-5 pt-6 md:px-8">
            <div className="absolute inset-x-0 top-0 h-9 bg-gradient-to-r from-[#f4f7ff] via-white to-[#f2f6ff]" />
            <div className="relative z-10 flex items-start justify-between gap-4">
              <h1 className="text-[31px] font-semibold leading-tight text-[#1b2435]">{title}</h1>
              <button
                onClick={handleLogout}
                className="rounded-full border border-[#e6ebf5] bg-white px-4 py-1.5 text-sm font-semibold text-[#5c6f8f] hover:bg-[#f4f7fd]"
              >
                Logout
              </button>
            </div>
          </header>

          <section className="flex-1 overflow-auto p-4 md:p-6">{children}</section>
        </main>
      </div>
    </div>
  );
}