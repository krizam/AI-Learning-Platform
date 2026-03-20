// App.jsx  ← FULL REPLACEMENT (your original + 3 imports + 3 routes, nothing else changed)

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Landing from './pages/Landing';
import About from './pages/About';
import Features from './pages/Features';
import Login from './pages/Login';
import Signup from './pages/Signup';
import OtpVerification from './pages/OtpVerification';
import Home from './pages/Home';
import ExploreCourses from './pages/ExploreCourses';
import CourseDetail from './pages/CourseDetail';
import AITutorChat from './pages/AITutorChat';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherCourseAssetsUpload from './pages/TeacherCourseAssetsUpload';
import MyCourses from './pages/MyCourses';
import ProfilePage from './pages/ProfilePage';
import CourseLearning from './pages/CourseLearning';
import StudentLearningHome from './pages/StudentLearningHome';
import Assignments from './pages/Assignments';
import AdminDashboard from './pages/AdminDashboard';
import AdminProfile from './pages/AdminProfile';
import AdminUsers from './pages/AdminUsers';
import AdminTeachers from './pages/AdminTeachers';
import StudentPaymentHistory from './pages/StudentPaymentHistory';
import TeacherPaymentHistory from './pages/TeacherPaymentHistory';
// ── NEW: 3 payment pages ─────────────────────────────────────────────────────
import PaymentPage    from './pages/PaymentPage';
import PaymentVerify  from './pages/PaymentVerify';
import PaymentSuccess from './pages/PaymentSuccess';
// ────────────────────────────────────────────────────────────────────────────

// ── TeacherRoute (unchanged) ──────────────────────────────────────────────────
const TeacherRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'teacher' && user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

// ── AdminRoute (unchanged) ────────────────────────────────────────────────────
const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

// ── DashboardRouter (unchanged) ───────────────────────────────────────────────
const DashboardRouter = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  if (user?.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
  if (user?.role === 'admin')   return <Navigate to="/admin" replace />;
  return <StudentDashboard />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ── Public Routes (unchanged) ── */}
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<Features />} />
          <Route path="/login"      element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup"     element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/verify-otp" element={<PublicRoute><OtpVerification /></PublicRoute>} />
          <Route path="/explore-courses" element={<ExploreCourses />} />

          {/* ── Protected Routes (unchanged) ── */}
          <Route path="/home"       element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/dashboard"  element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
          <Route path="/my-courses" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
          <Route path="/profile"    element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/course/:id" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
          <Route path="/ai-tutor"   element={<ProtectedRoute><AITutorChat /></ProtectedRoute>} />

          {/* ── NEW: Payment Routes ───────────────────────────────────────────
              /payment         — pay for teacher-approved paid enrollment
              /payment/verify  — Khalti redirects here after checkout
              /payment/success — standalone success page (optional)           */}
          <Route path="/payment"         element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
          <Route path="/payment/verify"  element={<ProtectedRoute><PaymentVerify /></ProtectedRoute>} />
          <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />

          {/* ── Teacher-only Routes (unchanged) ── */}
          <Route path="/teacher/dashboard" element={<TeacherRoute><TeacherDashboard /></TeacherRoute>} />
          <Route path="/teacher/courses"   element={<TeacherRoute><TeacherDashboard /></TeacherRoute>} />
          <Route path="/teacher/create-course" element={<TeacherRoute><TeacherDashboard /></TeacherRoute>} />
          <Route
            path="/teacher/courses/:courseId/assets"
            element={<TeacherRoute><TeacherCourseAssetsUpload /></TeacherRoute>}
          />
          <Route path="/teacher/payments"  element={<TeacherRoute><TeacherPaymentHistory /></TeacherRoute>} />

          {/* ── Admin Routes (unchanged) ── */}
          <Route path="/admin"          element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/profile"  element={<AdminRoute><AdminProfile /></AdminRoute>} />
          <Route path="/admin/users"    element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/teachers" element={<AdminRoute><AdminTeachers /></AdminRoute>} />

          {/* ── Student sub-routes (unchanged) ── */}
          <Route path="/student/course/:courseId/learn" element={<ProtectedRoute><CourseLearning /></ProtectedRoute>} />
          <Route path="/student/learning" element={<ProtectedRoute><StudentLearningHome /></ProtectedRoute>} />
          <Route path="/student/assignments"            element={<ProtectedRoute><Assignments /></ProtectedRoute>} />
          <Route path="/student/payments"               element={<ProtectedRoute><StudentPaymentHistory /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
