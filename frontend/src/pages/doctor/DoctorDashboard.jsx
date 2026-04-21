import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar,
  ChevronDown,
  FileText,
  HeartPulse,
  Home,
  MessageSquare,
  Search,
  Stethoscope,
  UserRound,
  Users,
  Pill
} from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import useAuth from '../../hooks/useAuth';
import { getAppointmentsByDoctor } from '../../services/appointmentService';

const resolveDoctorId = (user) => {
  const candidates = [
    user?.userId,
    user?.id,
    user?._id,
    user?.doctorId,
    user?.user?.userId,
    user?.user?.id,
    user?.user?._id,
    user?.user?.doctorId,
  ];

  const value = candidates.find((item) => typeof item === 'string' && item.trim());
  return value || '';
};

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState('');
  const doctorId = resolveDoctorId(user);

  const loadRecentAppointments = useCallback(async () => {
    setAppointmentsLoading(true);
    setAppointmentsError('');

    try {
      if (!doctorId) {
        setRecentAppointments([]);
        setAppointmentsError('Doctor session not found. Please log in again.');
        return;
      }

      const data = await getAppointmentsByDoctor(doctorId);
      setRecentAppointments(Array.isArray(data) ? data.slice(0, 5) : []);
    } catch (error) {
      setRecentAppointments([]);
      setAppointmentsError(error.response?.data?.message || 'Failed to load booked patients');
    } finally {
      setAppointmentsLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    loadRecentAppointments();
  }, [loadRecentAppointments]);
  
  const menuItems = [
    { icon: Home, label: 'Overview', active: true, path: '/doctor/dashboard' },
    { icon: Calendar, label: 'Appointments', path: '/doctor/appointments' },
    { icon: Stethoscope, label: 'Schedule', path: '/doctor/availability' },
    { icon: Users, label: 'Patients', path: '/doctor/patients' },
    { icon: FileText, label: 'Reports', path: '/doctor/reports' },
    { icon: Pill, label: 'Prescriptions', path: '/doctor/prescriptions' },
  ].map(item => ({
    ...item,
    onClick: () => navigate(item.path)
  }));

  const [rangeLabel] = useState('Last 30 days');
  
  const doctorName =
    user?.fullName ||
    user?.name ||
    user?.firstName ||
    (user?.email ? user.email.split('@')[0] : '') ||
    'Doctor';

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen bg-[#eff2f7] overflow-hidden">
      <div className="flex min-h-screen w-full gap-0">
        <Sidebar brand="HealthCheck" menuItems={menuItems} activeLabel="Overview" />

        <main className="flex min-h-screen flex-1 flex-col overflow-hidden bg-white">
          <header className="relative border-b border-[#e8ecf4] bg-[#f9fbff] px-5 pb-5 pt-6 md:px-8">
            <div className="absolute inset-x-0 top-0 h-9 bg-gradient-to-r from-[#f4f7ff] via-white to-[#f2f6ff]" />

            <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-[31px] font-semibold leading-tight text-[#1b2435]">Welcome back, {doctorName}</h1>
              </div>

              <div className="flex items-center gap-2 self-start">
                <button
                  onClick={handleLogout}
                  className="rounded-full border border-[#e6ebf5] bg-white px-3 py-1.5 text-xs font-semibold text-[#5c6f8f] hover:bg-[#f4f7fd]"
                >
                  Logout
                </button>
                <button className="grid h-9 w-9 place-items-center rounded-full border border-[#e6ebf5] bg-white text-[#68768f] hover:bg-[#f4f7fd]">
                  <FileText size={15} />
                </button>
                <button className="relative grid h-9 w-9 place-items-center rounded-full border border-[#e6ebf5] bg-white text-[#68768f] hover:bg-[#f4f7fd]">
                  <HeartPulse size={15} />
                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#ff5a6f]" />
                </button>
                <button className="flex items-center gap-2 rounded-full border border-[#e6ebf5] bg-white px-2 py-1">
                  <div className="grid h-6 w-6 place-items-center rounded-full bg-[#edf2ff] text-[#4865c4]">
                    <UserRound size={14} />
                  </div>
                  <ChevronDown size={14} className="text-[#8b97ac]" />
                </button>
              </div>
            </div>
          </header>

          <section className="flex-1 overflow-auto p-4 md:p-6">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {[
                ['Total Patients', '2,420', '47%'],
                ['New Appointments', '226', '10%'],
                ['Pending Reports', '193', '25%'],
              ].map(([title, value, change]) => (
                <article key={title} className="rounded-2xl border border-[#e8ecf4] bg-white p-4 shadow-sm">
                  <p className="text-sm text-[#667892]">{title}</p>
                  <div className="mt-2 flex items-end justify-between">
                    <h2 className="text-[34px] font-semibold leading-none text-[#1f2c43]">{value}</h2>
                    <span className="rounded-md bg-[#ebf8f0] px-2 py-0.5 text-xs font-medium text-[#1fa463]">{change}</span>
                  </div>
                  <div className="mt-3 h-8 rounded-md bg-gradient-to-r from-[#eef3fb] to-[#f9fbff]" />
                </article>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
              <article className="rounded-2xl border border-[#e8ecf4] p-4 lg:col-span-2">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#24334b]">Visitors Statistics</h3>
                  <button className="rounded-lg border border-[#e6ebf5] px-2 py-1 text-xs text-[#7a899f]">
                    {rangeLabel}
                  </button>
                </div>
                <div className="h-56 rounded-xl bg-gradient-to-b from-[#f6f9ff] to-[#ffffff]" />
              </article>

              <div className="space-y-3">
                <article className="rounded-2xl border border-[#e8ecf4] p-4">
                  <h3 className="mb-2 text-lg font-semibold text-[#24334b]">Blood Cancer Patient</h3>
                  <div className="h-32 rounded-xl bg-gradient-to-br from-[#fff7f8] to-[#ffffff]" />
                </article>
                <article className="rounded-2xl border border-[#e8ecf4] bg-gradient-to-br from-[#1f3666] to-[#0f2246] p-4 text-white">
                  <h3 className="mb-2 text-lg font-semibold">Kidney Damage Patient</h3>
                  <div className="h-28 rounded-xl bg-white/10" />
                </article>
              </div>
            </div>

            <article className="mt-3 rounded-2xl border border-[#e8ecf4] p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#24334b]">Recent Patient Appointment</h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 rounded-lg border border-[#e6ebf5] px-3 py-1.5 text-sm text-[#92a0b6]">
                    <Search size={14} />
                    Search patient...
                  </div>
                  <button className="rounded-lg border border-[#e6ebf5] px-3 py-1.5 text-sm text-[#6d7f9a]">Filters</button>
                </div>
              </div>
              {appointmentsLoading ? (
                <div className="rounded-xl bg-[#f8faff] p-4 text-sm text-slate-600">Loading booked patients...</div>
              ) : appointmentsError ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{appointmentsError}</div>
              ) : recentAppointments.length === 0 ? (
                <div className="rounded-xl bg-[#f8faff] p-4 text-sm text-slate-600">No booked patients yet.</div>
              ) : (
                <div className="space-y-3">
                  {recentAppointments.map((appointment) => (
                    <div key={appointment.id} className="rounded-xl border border-[#e8ecf4] bg-[#f8faff] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-[#24334b]">Patient: {appointment.patientId}</p>
                          <p className="text-xs text-[#6d7f9a]">{appointment.specialty} • {appointment.type}</p>
                        </div>
                        <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-[#6d7f9a]">
                          {appointment.status}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-[#6d7f9a]">
                        {appointment.appointmentDateTime ? new Date(appointment.appointmentDateTime).toLocaleString() : 'No schedule time'}
                      </p>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => navigate('/doctor/appointments')}
                    className="rounded-lg border border-[#e6ebf5] px-3 py-1.5 text-sm text-[#6d7f9a] hover:bg-[#f4f7fd]"
                  >
                    View all appointments
                  </button>
                </div>
              )}
            </article>
          </section>
        </main>

        <aside className="fixed inset-x-0 bottom-0 border-t border-[#dfe4ef] bg-white p-2 shadow-lg lg:hidden">
          <div className="grid grid-cols-5 gap-1 text-[#6f7f97]">
            {[Home, Calendar, Stethoscope, Users, MessageSquare].map((Icon, idx) => (
              <button key={idx} className="grid place-items-center rounded-xl py-2 hover:bg-[#f1f5ff]">
                <Icon size={17} />
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
