import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { FaChalkboardTeacher, FaUserShield, FaUsers } from 'react-icons/fa';
import { adminAPI } from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTeachers: 0,
    totalAdmins: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        const data = await adminAPI.getStats();
        if (isMounted) {
          setStats(data);
          setError('');
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message || 'Failed to load dashboard statistics'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const cards = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: FaUsers,
      gradient: 'from-blue-500 to-cyan-500',
      sub: 'All registered accounts',
    },
    {
      label: 'Teachers',
      value: stats.totalTeachers,
      icon: FaChalkboardTeacher,
      gradient: 'from-emerald-500 to-green-500',
      sub: 'Active instructors',
    },
    {
      label: 'Admins',
      value: stats.totalAdmins,
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

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {cards.map((stat) => (
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
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {loading ? '—' : stat.value}
                </p>
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

