import AdminLayout from '../components/AdminLayout';
import { FaChalkboardTeacher, FaUserShield, FaUsers } from 'react-icons/fa';

const AdminDashboard = () => {
  // Mock stats for now – replace with real data when backend is ready.
  const stats = [
    {
      label: 'Total Users',
      value: 1280,
      icon: FaUsers,
      gradient: 'from-blue-500 to-cyan-500',
      sub: 'All registered accounts',
    },
    {
      label: 'Teachers',
      value: 42,
      icon: FaChalkboardTeacher,
      gradient: 'from-emerald-500 to-green-500',
      sub: 'Active instructors',
    },
    {
      label: 'Admins',
      value: 3,
      icon: FaUserShield,
      gradient: 'from-purple-500 to-pink-500',
      sub: 'System administrators',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            High-level overview of users and teachers. Use the sidebar to manage data.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4 shadow-sm"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${stat.gradient}`}
              >
                <stat.icon className="text-white text-lg" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
            Quick tips
          </h2>
          <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1 list-disc list-inside">
            <li>Use the Users page to manage roles, status, and access.</li>
            <li>Use the Teachers page to manage subject information and experience.</li>
            <li>All changes are local-only for now; integrate with your API later.</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

