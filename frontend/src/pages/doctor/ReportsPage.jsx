import DoctorPageLayout from '../../components/doctor/DoctorPageLayout';

export default function ReportsPage() {
  return (
    <DoctorPageLayout activeLabel="Reports" title="Reports">
      <div className="rounded-xl border border-[#e8ecf4] bg-white p-6">
        <p className="text-lg font-semibold text-[#1b2435]">Reports</p>
      </div>
    </DoctorPageLayout>
  );
}
