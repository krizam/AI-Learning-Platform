// StudentDashboard.jsx

// ── React & routing ───────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ── Auth & API ────────────────────────────────────────────────────────────────
import { useAuth } from '../context/AuthContext';
import { courseAPI } from '../services/api';

// ── Assets ────────────────────────────────────────────────────────────────────
import logo from '../assets/logo/logo1.png';

// ── Icons (react-icons/fa only) ───────────────────────────────────────────────
import {
  FaBook,
  FaRobot,
  FaFire,
  FaTrophy,
  FaChartLine,
  FaPlay,
  FaCompass,
  FaGraduationCap,
  FaClock,
  FaCheckCircle,
  FaSpinner,
  FaCalendarAlt,
  FaMedal,
  FaArrowRight,
  FaBookOpen,
} from 'react-icons/fa';

// ── Layout shell ──────────────────────────────────────────────────────────────
import StudentShell from '../components/StudentShell';

// =============================================================================
// Mock / placeholder data
// These will be replaced by real API data once those endpoints are available.
// =============================================================================

const MOCK_DEADLINES = [
  { id: 1, title: 'Python Quiz',          course: 'Intro to Python',  date: 'Mar 12', urgent: true  },
  { id: 2, title: 'UI Mockup Submission', course: 'UI/UX Design',     date: 'Mar 15', urgent: false },
  { id: 3, title: 'Final Project',        course: 'Web Development',  date: 'Mar 20', urgent: false },
];

const MOCK_ACHIEVEMENTS = [
  { id: 1, title: 'First Enrollment', icon: '🎯', earned: true  },
  { id: 2, title: 'Fast Learner',     icon: '⚡', earned: true  },
  { id: 3, title: 'Course Completer', icon: '🏆', earned: false },
  { id: 4, title: '7-Day Streak',     icon: '🔥', earned: false },
];

const WEEKLY_ACTIVITY = [
  { day: 'Mon', hours: 2   },
  { day: 'Tue', hours: 1.5 },
  { day: 'Wed', hours: 3   },
  { day: 'Thu', hours: 0.5 },
  { day: 'Fri', hours: 2.5 },
  { day: 'Sat', hours: 1   },
  { day: 'Sun', hours: 0   },
];

// Placeholder per-course progress percentages indexed by enrollment order
const MOCK_PROGRESS = [60, 30, 80, 45, 15, 90, 55, 70, 25];

// Gradient classes cycled across course cards for visual variety
const PROGRESS_COLORS = [
  'from-blue-500 to-cyan-400',
  'from-purple-500 to-pink-400',
  'from-green-500 to-emerald-400',
  'from-orange-500 to-amber-400',
];

// Tab identifiers for the content switcher
const TABS = ['overview', 'progress', 'achievements'];

// =============================================================================
// Sub-components
// =============================================================================

// ── ProgressBar ───────────────────────────────────────────────────────────────
// Generic horizontal progress bar.
// `gradient` accepts a Tailwind `from-*` / `to-*` pair string.
const ProgressBar = ({ value, gradient = 'from-blue-500 to-blue-400' }) => (
  <div className="w-full bg-slate-200 rounded-full h-2">
    <div
      className={`h-2 rounded-full bg-gradient-to-r ${gradient} transition-all duration-700`}
      style={{ width: `${Math.min(value, 100)}%` }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    />
  </div>
);

// ── StatCard ──────────────────────────────────────────────────────────────────
// Summary metric tile used in the stats row at the top of the dashboard.
const StatCard = ({ icon: Icon, label, value, gradient, sub }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center space-x-4 hover:shadow-md transition-shadow">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${gradient}`}>
      <Icon className="text-white text-xl" />
    </div>
    <div className="min-w-0">
      <p className="text-2xl font-bold text-slate-900 truncate">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
      {sub && <p className="text-xs text-green-600 font-medium mt-0.5">{sub}</p>}
    </div>
  </div>
);

// =============================================================================
// StudentDashboard
// =============================================================================
const StudentDashboard = () => {
  const { user }   = useAuth();
  const navigate   = useNavigate();

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [activeTab,       setActiveTab]       = useState('overview');

  // Fetch the student's enrolled courses on mount (API call unchanged)
  useEffect(() => {
    const fetchEnrolled = async () => {
      setLoading(true);
      try {
        const data = await courseAPI.getEnrolledCourses();
        setEnrolledCourses(data.courses || []);
      } catch {
        setEnrolledCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrolled();
  }, []);

  // ── Derived values ──────────────────────────────────────────────────────────

  // Average progress across all enrolled courses using mock progress data
  const totalProgress =
    enrolledCourses.length > 0
      ? Math.round(
          enrolledCourses.reduce((acc, _, i) => acc + (MOCK_PROGRESS[i] ?? 50), 0) /
          enrolledCourses.length
        )
      : 0;

  const maxHours   = Math.max(...WEEKLY_ACTIVITY.map((d) => d.hours));
  const totalHours = WEEKLY_ACTIVITY.reduce((a, d) => a + d.hours, 0).toFixed(1);

  const earnedCount = MOCK_ACHIEVEMENTS.filter((a) => a.earned).length;

  // First name used in the greeting to keep it friendly and short
  const firstName = user?.name?.split(' ')[0] || 'Student';

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <StudentShell>

      {/* ── Welcome banner ─────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 rounded-2xl p-6 sm:p-8 mb-8 text-white relative overflow-hidden">
        {/* Decorative background circles — purely cosmetic */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-white rounded-full" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white rounded-full" />
        </div>

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <FaFire className="text-yellow-300" />
              <span className="text-blue-100 text-sm font-medium">3 day streak!</span>
            </div>
            <h2 className="text-3xl font-bold mb-1">
              Welcome back, {firstName}! 👋
            </h2>
            <p className="text-blue-100">
              You have{' '}
              <span className="text-white font-semibold">{enrolledCourses.length} courses</span>{' '}
              in progress. Keep it up!
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <img
              src={logo}
              alt="Vidyalaya"
              className="h-10 w-10 rounded-xl bg-white/15 p-1.5 ring-1 ring-white/20"
            />
            <button
              onClick={() => navigate('/explore-courses')}
              className="flex items-center space-x-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl font-medium transition-all text-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <FaCompass /><span>Explore</span>
            </button>
            <button
              onClick={() => navigate('/ai-tutor')}
              className="flex items-center space-x-2 px-4 py-2.5 bg-white text-blue-700 rounded-xl font-semibold hover:bg-blue-50 transition-all text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <FaRobot /><span>AI Tutor</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats row ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={FaBook}
          label="Enrolled"
          value={enrolledCourses.length}
          gradient="from-blue-500 to-blue-600"
          sub="Active courses"
        />
        <StatCard
          icon={FaChartLine}
          label="Avg Progress"
          value={`${totalProgress}%`}
          gradient="from-green-500 to-emerald-600"
          sub={totalProgress > 50 ? 'Great pace!' : 'Keep going!'}
        />
        <StatCard
          icon={FaTrophy}
          label="Achievements"
          value={earnedCount}
          gradient="from-yellow-500 to-orange-500"
          sub="Badges earned"
        />
        <StatCard
          icon={FaClock}
          label="Hours This Week"
          value={totalHours}
          gradient="from-purple-500 to-violet-600"
          sub="Learning time"
        />
      </div>

      {/* ── Tab switcher ───────────────────────────────────────────────────── */}
      {/* Uses overflow-x-auto so it scrolls on small screens instead of wrapping */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex space-x-1 bg-white rounded-xl p-1 shadow-sm border border-slate-200 w-fit min-w-full sm:min-w-0">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              aria-pressed={activeTab === tab}
              className={[
                'px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all whitespace-nowrap',
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
              ].join(' ')}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          Overview tab
          ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left column — Continue Learning + Deadlines */}
          <div className="lg:col-span-2 space-y-6">

            {/* Continue Learning card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                  <FaPlay className="text-blue-500" /><span>Continue Learning</span>
                </h3>
                <button
                  onClick={() => navigate('/my-courses')}
                  className="text-sm text-blue-600 hover:underline flex items-center space-x-1 focus:outline-none focus:underline"
                >
                  <span>View all</span><FaArrowRight className="text-xs" />
                </button>
              </div>

              {/* Loading state */}
              {loading && (
                <div className="flex justify-center py-8">
                  <FaSpinner className="text-2xl text-blue-500 animate-spin" />
                </div>
              )}

              {/* Empty state */}
              {!loading && enrolledCourses.length === 0 && (
                <div className="text-center py-8">
                  <FaBookOpen className="text-4xl text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm mb-3">No courses enrolled yet.</p>
                  <button
                    onClick={() => navigate('/explore-courses')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    Explore Courses
                  </button>
                </div>
              )}

              {/* Course list — shows up to 3 most recent enrollments */}
              {!loading && enrolledCourses.length > 0 && (
                <div className="space-y-3">
                  {enrolledCourses.slice(0, 3).map((course, i) => (
                    <div
                      key={course.id}
                      className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      {/* Course colour swatch */}
                      <div
                        className={`w-11 h-11 rounded-xl bg-gradient-to-br ${course.color || 'from-blue-500 to-cyan-500'} flex items-center justify-center flex-shrink-0`}
                      >
                        <FaBook className="text-white text-sm" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 text-sm truncate">{course.title}</p>
                        <p className="text-xs text-slate-400 mb-1.5">{course.instructor}</p>
                        <ProgressBar
                          value={MOCK_PROGRESS[i] ?? 50}
                          gradient={PROGRESS_COLORS[i % PROGRESS_COLORS.length]}
                        />
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-bold text-slate-700 mb-2">{MOCK_PROGRESS[i] ?? 50}%</p>
                        <button
                          onClick={() => navigate(`/student/course/${course.id}/learn`)}
                          aria-label={`Continue ${course.title}`}
                          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                          <FaPlay className="text-xs" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Deadlines card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2 mb-4">
                <FaCalendarAlt className="text-orange-500" /><span>Upcoming Deadlines</span>
              </h3>
              <div className="space-y-3">
                {MOCK_DEADLINES.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      {/* Urgency dot — red for urgent, green for upcoming */}
                      <div
                        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${d.urgent ? 'bg-red-500' : 'bg-green-500'}`}
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{d.title}</p>
                        <p className="text-xs text-slate-400">{d.course}</p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        d.urgent
                          ? 'bg-red-100 text-red-600'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {d.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column — Weekly Activity */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
                <FaFire className="text-orange-500" /><span>Weekly Activity</span>
              </h3>
              {/* Mini bar chart — bar height proportional to maxHours */}
              <div className="flex items-end space-x-2 h-28 mb-3">
                {WEEKLY_ACTIVITY.map((d) => (
                  <div key={d.day} className="flex-1 flex flex-col items-center space-y-1">
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-blue-600 to-blue-400 transition-all"
                      style={{
                        height:    `${(d.hours / maxHours) * 88}px`,
                        minHeight: d.hours > 0 ? '6px' : '2px',
                        opacity:   d.hours > 0 ? 1 : 0.2,
                      }}
                    />
                    <span className="text-xs text-slate-400">{d.day}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 text-center">{totalHours} hrs total this week</p>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          Progress tab
          ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'progress' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Per-course progress bars */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center space-x-2">
              <FaChartLine className="text-blue-500" /><span>Course Progress</span>
            </h3>
            {enrolledCourses.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">
                Enroll in courses to track progress
              </p>
            ) : (
              <div className="space-y-5">
                {enrolledCourses.map((course, i) => (
                  <div key={course.id}>
                    <div className="flex justify-between items-center mb-1.5">
                      <p className="text-sm font-semibold text-slate-900 truncate max-w-[70%]">
                        {course.title}
                      </p>
                      <span className="text-sm font-bold text-blue-600">
                        {MOCK_PROGRESS[i] ?? 50}%
                      </span>
                    </div>
                    <ProgressBar
                      value={MOCK_PROGRESS[i] ?? 50}
                      gradient={PROGRESS_COLORS[i % PROGRESS_COLORS.length]}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expanded weekly learning bar chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center space-x-2">
              <FaFire className="text-orange-500" /><span>Weekly Learning</span>
            </h3>
            <div className="flex items-end space-x-3 h-44 mb-4">
              {WEEKLY_ACTIVITY.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center space-y-2">
                  <span className="text-xs text-slate-400">{d.hours}h</span>
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-blue-400"
                    style={{
                      height:    `${(d.hours / maxHours) * 120}px`,
                      minHeight: d.hours > 0 ? '8px' : '2px',
                      opacity:   d.hours > 0 ? 1 : 0.2,
                    }}
                  />
                  <span className="text-xs text-slate-500 font-medium">{d.day}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm pt-4 border-t border-slate-100">
              <span className="text-slate-500">Total this week</span>
              <span className="font-bold text-slate-900">{totalHours} hours</span>
            </div>
          </div>

          {/* Performance summary tiles */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center space-x-2">
              <FaTrophy className="text-yellow-500" /><span>Performance Summary</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Courses Enrolled', value: enrolledCourses.length, icon: '📚' },
                { label: 'Avg. Progress',    value: `${totalProgress}%`,    icon: '📈' },
                { label: 'Hours Learned',    value: `${totalHours}h`,       icon: '⏱️' },
                { label: 'Day Streak',       value: '3 days',               icon: '🔥' },
              ].map((s) => (
                <div key={s.label} className="text-center p-4 bg-slate-50 rounded-xl">
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <p className="text-xl font-bold text-slate-900">{s.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          Achievements tab
          ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'achievements' && (
        <div className="space-y-6">

          {/* Achievement badge grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {MOCK_ACHIEVEMENTS.map((a) => (
              <div
                key={a.id}
                className={[
                  'bg-white rounded-2xl shadow-sm border p-6 text-center transition-all',
                  a.earned
                    ? 'border-yellow-200 hover:shadow-lg'
                    : 'border-slate-200 opacity-50',
                ].join(' ')}
              >
                {/* grayscale filter applied to locked badges */}
                <div className={`text-5xl mb-3 ${!a.earned ? 'grayscale' : ''}`}>
                  {a.icon}
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-2">{a.title}</h4>
                {a.earned ? (
                  <div className="flex items-center justify-center space-x-1 text-green-600 text-xs">
                    <FaCheckCircle /><span>Earned</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-1 text-slate-400 text-xs">
                    <FaMedal /><span>Locked</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Certificates placeholder */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center">
            <FaGraduationCap className="text-5xl text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">No Certificates Yet</h3>
            <p className="text-slate-500 text-sm mb-4">
              Complete a course to earn your first certificate!
            </p>
            <button
              onClick={() => navigate('/my-courses')}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              View My Courses
            </button>
          </div>
        </div>
      )}

    </StudentShell>
  );
};

export default StudentDashboard;
