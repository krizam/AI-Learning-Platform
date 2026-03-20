// StudentLearningHome.jsx
//
// This is a redirect-only route. On mount it fetches the student's enrolled
// courses and immediately navigates to the first course's learning page.
// It only renders UI when there are no enrolled courses (empty state) or
// while the redirect is still pending (loading state).

// ── React & routing ───────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ── Layout shell & API ────────────────────────────────────────────────────────
import StudentShell from '../components/StudentShell';
import { courseAPI } from '../services/api';

// ── Icons (react-icons/fa only) ───────────────────────────────────────────────
import { FaSpinner, FaBookOpen } from 'react-icons/fa';

// =============================================================================
// StudentLearningHome
// =============================================================================
const StudentLearningHome = () => {
  const navigate = useNavigate();

  const [loading,    setLoading]    = useState(true);
  const [hasCourses, setHasCourses] = useState(true);

  useEffect(() => {
    const redirectToFirstCourse = async () => {
      setLoading(true);
      try {
        const data    = await courseAPI.getEnrolledCourses();
        const courses = data?.courses || [];

        if (!courses.length) {
          // No enrollments — show the empty state instead of redirecting
          setHasCourses(false);
          return;
        }

        // Redirect to the first enrolled course's learning page
        navigate(`/student/course/${courses[0].id}/learn`, { replace: true });
      } catch {
        // On API error, fall through to the empty / no-courses UI
        setHasCourses(false);
      } finally {
        setLoading(false);
      }
    };

    redirectToFirstCourse();
  }, [navigate]);

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <StudentShell>
        <div className="flex items-center justify-center py-32">
          <FaSpinner className="animate-spin text-4xl text-blue-500" />
        </div>
      </StudentShell>
    );
  }

  // ── No enrolled courses ─────────────────────────────────────────────────────
  if (!hasCourses) {
    return (
      <StudentShell>
        <div className="flex items-center justify-center py-20 px-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
            <FaBookOpen className="text-5xl text-slate-200 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">No enrolled courses</h2>
            <p className="text-sm text-slate-500 mb-6">
              Enroll in a course first to start learning.
            </p>
            <button
              type="button"
              onClick={() => navigate('/explore-courses')}
              className="w-full py-2.5 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            >
              Explore Courses
            </button>
          </div>
        </div>
      </StudentShell>
    );
  }

  // Should never reach here — we redirect when courses exist.
  return null;
};

export default StudentLearningHome;
