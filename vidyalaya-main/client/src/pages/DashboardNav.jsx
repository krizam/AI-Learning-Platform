import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaBell,
  FaBars,
  FaTimes,
  FaHome,
  FaTh,
  FaBook,
  FaCompass,
  FaRobot,
  FaSignOutAlt,
} from 'react-icons/fa';

const MOCK_NOTIFICATIONS = [
  { id: 1, message: 'New lesson added to Web Development Bootcamp', time: '2 hrs ago', read: false },
  { id: 2, message: 'You completed "Variables & Data Types"', time: '1 day ago', read: false },
  { id: 3, message: 'Quiz deadline tomorrow: Python Basics', time: '1 day ago', read: true },
  { id: 4, message: 'Instructor posted an announcement', time: '2 days ago', read: true },
];

const DashboardNav = ({ activePage }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [mobileMenu, setMobileMenu] = useState(false);

  const unread = notifications.filter((n) => !n.read).length;

  const navLinks = [
    { label: 'Home',       path: '/home',            icon: FaHome    },
    { label: 'Dashboard',  path: '/dashboard',       icon: FaTh      },
    { label: 'My Courses', path: '/my-courses',      icon: FaBook    },
    { label: 'Explore',    path: '/explore-courses', icon: FaCompass },
    { label: 'AI Tutor',   path: '/ai-tutor',        icon: FaRobot   },
  ];

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* ── Logo ── */}
          <div
            className="flex-shrink-0 cursor-pointer"
            onClick={() => navigate('/dashboard')}
          >
            <span className="text-2xl font-extrabold text-blue-500 tracking-tight">
              Vidyalaya
            </span>
          </div>

          {/* ── Nav Links (desktop) ── */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = activePage === link.path;
                return (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className={`text-sm ${isActive ? 'text-white' : ''}`} />
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Right: Bell + Avatar + Logout ── */}
          <div className="flex items-center space-x-2 flex-shrink-0">

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <FaBell className="text-lg" />
                {unread > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold leading-none">
                    {unread}
                  </span>
                )}
              </button>

              {/* Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Notifications</h4>
                    <button
                      onClick={() => setNotifications((p) => p.map((n) => ({ ...n, read: true })))}
                      className="text-xs text-blue-500 hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 flex items-start space-x-3 ${!n.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                      >
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? 'bg-blue-500' : 'bg-slate-300'}`} />
                        <div>
                          <p className="text-sm text-slate-700 dark:text-slate-300">{n.message}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Avatar */}
            <button
              onClick={() => navigate('/profile')}
              className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm hover:ring-2 hover:ring-blue-400 hover:ring-offset-1 transition-all overflow-hidden flex-shrink-0"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0)?.toUpperCase() || 'U'
              )}
            </button>

            {/* Logout (desktop) */}
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <FaSignOutAlt className="text-sm" />
              <span>Logout</span>
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="md:hidden p-2 text-slate-500 dark:text-slate-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenu ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        {mobileMenu && (
          <div className="md:hidden pb-4 space-y-1 pt-2 border-t border-slate-100 dark:border-slate-700">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activePage === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => { navigate(link.path); setMobileMenu(false); }}
                  className={`w-full text-left flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-500 text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className="text-sm" />
                  <span>{link.label}</span>
                </button>
              );
            })}
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="w-full text-left flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <FaSignOutAlt className="text-sm" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default DashboardNav;
