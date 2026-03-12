import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import StudentShell from '../components/StudentShell';
import {
  FaUser, FaEnvelope, FaLock, FaCamera, FaCheckCircle,
  FaExclamationCircle, FaSpinner, FaShieldAlt, FaBell,
  FaPalette, FaTrash,
} from 'react-icons/fa';

const ProfilePage = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState('profile');

  // Profile form state
  const [profileData, setProfileData] = useState({ name: '', email: '' });

  // Sync profile form when user loads
  useEffect(() => {
    if (user) {
      setProfileData({ name: user.name || '', email: user.email || '' });
    }
  }, [user]);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password form state
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Notification preferences (mock)
  const [notifPrefs, setNotifPrefs] = useState({
    newLesson: true,
    deadlineReminder: true,
    announcements: false,
    weeklyReport: true,
  });

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess('');
    setProfileError('');
    try {
      const updatedUser = await authAPI.updateProfile(profileData.name, profileData.email);
      updateUser(updatedUser);
      setProfileSuccess('Profile updated successfully!');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    setPasswordLoading(true);
    try {
      await authAPI.changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordSuccess('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const sections = [
    { id: 'profile', label: 'Profile Info', icon: FaUser },
    { id: 'password', label: 'Password', icon: FaLock },
    { id: 'notifications', label: 'Notifications', icon: FaBell },
    { id: 'account', label: 'Account', icon: FaShieldAlt },
  ];

  return (
    <StudentShell>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">My Profile</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* ── Sidebar ── */}
          <div className="lg:col-span-1">
            {/* Avatar Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 text-center mb-4">
              <div className="relative inline-block mb-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-3xl font-bold mx-auto">
                  {user?.name?.charAt(0)?.toUpperCase() || 'S'}
                </div>
                <button className="absolute bottom-0 right-0 w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors shadow-lg">
                  <FaCamera className="text-xs" />
                </button>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">{user?.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
              <span className="inline-flex items-center mt-2 px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 capitalize">
                {user?.role}
              </span>
              <p className="text-xs text-slate-400 mt-3">
                Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}
              </p>
            </div>

            {/* Nav */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-2">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                    activeSection === s.id
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <s.icon className="text-sm flex-shrink-0" />
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Main Content ── */}
          <div className="lg:col-span-3">

            {/* ── Profile Info Section ── */}
            {activeSection === 'profile' && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center space-x-2">
                  <FaUser className="text-primary-500" /><span>Profile Information</span>
                </h3>

                {profileSuccess && (
                  <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400 text-sm flex items-center space-x-2">
                    <FaCheckCircle /><span>{profileSuccess}</span>
                  </div>
                )}
                {profileError && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm flex items-center space-x-2">
                    <FaExclamationCircle /><span>{profileError}</span>
                  </div>
                )}

                <form onSubmit={handleProfileSave} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                    <div className="relative">
                      <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Role</label>
                    <input
                      type="text"
                      value={user?.role || 'student'}
                      disabled
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-sm capitalize cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-400 mt-1">Role cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Member Since</label>
                    <input
                      type="text"
                      value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      disabled
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-sm cursor-not-allowed"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={profileLoading}
                      className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
                    >
                      {profileLoading ? <><FaSpinner className="animate-spin" /><span>Saving...</span></> : <><FaCheckCircle /><span>Save Changes</span></>}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── Password Section ── */}
            {activeSection === 'password' && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center space-x-2">
                  <FaLock className="text-primary-500" /><span>Change Password</span>
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Choose a strong password to keep your account secure.</p>

                {passwordSuccess && (
                  <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400 text-sm flex items-center space-x-2">
                    <FaCheckCircle /><span>{passwordSuccess}</span>
                  </div>
                )}
                {passwordError && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm flex items-center space-x-2">
                    <FaExclamationCircle /><span>{passwordError}</span>
                  </div>
                )}

                <form onSubmit={handlePasswordChange} className="space-y-5">
                  {[
                    { label: 'Current Password', key: 'currentPassword', placeholder: 'Enter current password' },
                    { label: 'New Password', key: 'newPassword', placeholder: 'At least 6 characters' },
                    { label: 'Confirm New Password', key: 'confirmPassword', placeholder: 'Repeat new password' },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{field.label}</label>
                      <div className="relative">
                        <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                        <input
                          type="password"
                          value={passwordData[field.key]}
                          onChange={(e) => setPasswordData({ ...passwordData, [field.key]: e.target.value })}
                          placeholder={field.placeholder}
                          className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                        />
                      </div>
                    </div>
                  ))}

                  {/* Password strength hint */}
                  {passwordData.newPassword && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl text-xs text-slate-500 dark:text-slate-400 space-y-1">
                      <p className={passwordData.newPassword.length >= 6 ? 'text-green-600 dark:text-green-400' : ''}>
                        {passwordData.newPassword.length >= 6 ? '✅' : '❌'} At least 6 characters
                      </p>
                      <p className={/[A-Z]/.test(passwordData.newPassword) ? 'text-green-600 dark:text-green-400' : ''}>
                        {/[A-Z]/.test(passwordData.newPassword) ? '✅' : '❌'} One uppercase letter
                      </p>
                      <p className={/[0-9]/.test(passwordData.newPassword) ? 'text-green-600 dark:text-green-400' : ''}>
                        {/[0-9]/.test(passwordData.newPassword) ? '✅' : '❌'} One number
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
                  >
                    {passwordLoading ? <><FaSpinner className="animate-spin" /><span>Updating...</span></> : <><FaShieldAlt /><span>Update Password</span></>}
                  </button>
                </form>
              </div>
            )}

            {/* ── Notifications Section ── */}
            {activeSection === 'notifications' && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center space-x-2">
                  <FaBell className="text-primary-500" /><span>Notification Preferences</span>
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Choose what updates you want to receive.</p>

                <div className="space-y-4">
                  {[
                    { key: 'newLesson', label: 'New Lesson Added', desc: 'When a new lesson is added to your enrolled course' },
                    { key: 'deadlineReminder', label: 'Deadline Reminders', desc: 'Reminders about upcoming quiz and assignment deadlines' },
                    { key: 'announcements', label: 'Instructor Announcements', desc: 'When your instructor posts an announcement' },
                    { key: 'weeklyReport', label: 'Weekly Progress Report', desc: 'A summary of your learning activity every week' },
                  ].map((pref) => (
                    <div key={pref.key} className="flex items-start justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-primary-200 dark:hover:border-primary-800 transition-colors">
                      <div className="flex-1 pr-4">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{pref.label}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{pref.desc}</p>
                      </div>
                      <button
                        onClick={() => setNotifPrefs((p) => ({ ...p, [pref.key]: !p[pref.key] }))}
                        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${notifPrefs[pref.key] ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${notifPrefs[pref.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  ))}
                </div>

                <button className="mt-6 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-600 transition-all shadow-lg flex items-center space-x-2 text-sm">
                  <FaCheckCircle /><span>Save Preferences</span>
                </button>
              </div>
            )}

            {/* ── Account Section ── */}
            {activeSection === 'account' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
                    <FaShieldAlt className="text-primary-500" /><span>Account Details</span>
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Account ID', value: user?.id || 'N/A' },
                      { label: 'Email Verified', value: user?.isEmailVerified ? '✅ Verified' : '❌ Not Verified' },
                      { label: 'Account Type', value: user?.role || 'student' },
                      { label: 'Joined', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
                        <span className="text-sm text-slate-500 dark:text-slate-400">{item.label}</span>
                        <span className="text-sm font-medium text-slate-900 dark:text-white capitalize">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-red-200 dark:border-red-900/50 p-6">
                  <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-4 flex items-center space-x-2">
                    <FaTrash /><span>Danger Zone</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 rounded-xl">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Log out of all devices</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Revoke all active sessions</p>
                      </div>
                      <button
                        onClick={() => { logout(); navigate('/login'); }}
                        className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm font-semibold hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                      >
                        Log Out
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 rounded-xl">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Delete Account</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Permanently delete your account and all data</p>
                      </div>
                      <button
                        onClick={() => alert('Contact support to delete your account')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </StudentShell>
  );
};

export default ProfilePage;
