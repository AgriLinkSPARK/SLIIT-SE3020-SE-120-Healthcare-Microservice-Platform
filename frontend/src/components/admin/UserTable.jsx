export default function UserTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Role</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-4 py-2">Sample User</td>
            <td className="px-4 py-2">sample@healthcare.local</td>
            <td className="px-4 py-2">PATIENT</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
