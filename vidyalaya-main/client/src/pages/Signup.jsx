import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaSpinner } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import logo from '../assets/logo/logo1.png';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fromPathname = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const result = await register(formData.name, formData.email, formData.password, formData.role);

    if (result.success) {
      navigate(fromPathname, { replace: true });
    } else {
      setError(result.error || 'Registration failed. Please try again.');
    }

    setLoading(false);
  };

  const inputFocus = (e) => (e.target.style.boxShadow = '0 0 0 3px rgba(21,101,192,0.18)');
  const inputBlur = (e) => (e.target.style.boxShadow = 'none');

  const inputClass =
    'w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all text-sm';

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900">
      <Navbar />
      
      <div className="flex-1 flex">
        {/* ── Left Panel ── */}
        <div
          className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1a3a6b 0%, #1e4d8c 40%, #1565c0 100%)' }}
        >
          {/* Dot-grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />

          {/* Decorative blurred circles */}
          <div
            className="absolute top-[-80px] left-[-80px] w-80 h-80 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #90caf9, transparent 70%)' }}
          />
          <div
            className="absolute bottom-[-60px] right-[-60px] w-64 h-64 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #42a5f5, transparent 70%)' }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center px-12">
            <img src={logo} alt="Vidyalaya" className="w-36 h-36 object-contain mb-6 drop-shadow-2xl" />
            <h1
              className="text-5xl font-extrabold text-white mb-3 tracking-tight"
              style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: '-0.5px' }}
            >
              Vidyalaya
            </h1>
            <p
              className="text-lg font-medium mb-2"
              style={{ color: '#90caf9', fontFamily: "'Poppins', sans-serif" }}
            >
              पढ्यो नेपाल बढ्यो नेपाल
            </p>
            <p className="text-sm mt-4 max-w-xs" style={{ color: 'rgba(255,255,255,0.65)', fontFamily: "'Poppins', sans-serif" }}>
              Join thousands of learners building their future with AI-powered education.
            </p>
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white dark:bg-slate-900 overflow-y-auto">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="flex lg:hidden flex-col items-center mb-8">
              <img src={logo} alt="Vidyalaya" className="w-20 h-20 object-contain mb-3" />
              <h1
                className="text-3xl font-extrabold"
                style={{ color: '#1565c0', fontFamily: "'Poppins', sans-serif" }}
              >
                Vidyalaya
              </h1>
            </div>

            {/* Card */}
            <div
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-100 dark:border-slate-700"
              style={{ boxShadow: '0 8px 40px rgba(21,101,192,0.10)' }}
            >
              <h2
                className="text-2xl font-bold text-slate-900 dark:text-white mb-1"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Create Account
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-7" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Join our learning community today
              </p>

              {error && (
                <div className="mb-5 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Nirdesh Bakhunchhe"
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="you@example.com"
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                </div>

                {/* Role */}
                <div>
                  <label
                    htmlFor="role"
                    className="block text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    I am a
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className={inputClass}
                    style={{ appearance: 'auto' }}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                  </select>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="At least 6 characters"
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Confirm your password"
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white py-3 px-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm mt-1"
                  style={{
                    background: 'linear-gradient(135deg, #1565c0 0%, #1e88e5 100%)',
                    fontFamily: "'Poppins', sans-serif",
                    boxShadow: '0 4px 18px rgba(21,101,192,0.35)',
                  }}
                  onMouseEnter={e => !loading && (e.target.style.opacity = '0.92')}
                  onMouseLeave={e => (e.target.style.opacity = '1')}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <FaSpinner className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" />
                      Creating account...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-bold transition-colors"
                    style={{ color: '#1565c0' }}
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>

            <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500" style={{ fontFamily: "'Poppins', sans-serif" }}>
              © 2024 Vidyalaya. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Signup;
