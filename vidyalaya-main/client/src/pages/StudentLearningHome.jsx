import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import StudentShell from '../components/StudentShell';
import { courseAPI } from '../services/api';

const StudentLearningHome = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hasCourses, setHasCourses] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const data = await courseAPI.getEnrolledCourses();
        const courses = data?.courses || [];

        if (!courses.length) {
          setHasCourses(false);
          return;
        }

        // Redirect to the first enrolled course's learning page.
        navigate(`/student/course/${courses[0].id}/learn`, { replace: true });
      } catch {
        setHasCourses(false);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [navigate]);

  if (loading) {
    return (
      <StudentShell>
        <div className="min-h-screen flex items-center justify-center">
          <FaSpinner className="animate-spin text-4xl text-primary-500" />
        </div>
      </StudentShell>
    );
  }

  if (!hasCourses) {
    return (
      <StudentShell>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 shadow-lg">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">No enrolled courses</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
              Enroll in a course first to start learning.
            </p>
            <button
              type="button"
              onClick={() => navigate('/explore-courses')}
              className="mt-5 w-full py-2.5 rounded-xl font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              Explore Courses
            </button>
          </div>
        </div>
      </StudentShell>
    );
  }

  // Should never render because we redirect when courses exist.
  return null;
};

export default StudentLearningHome;

