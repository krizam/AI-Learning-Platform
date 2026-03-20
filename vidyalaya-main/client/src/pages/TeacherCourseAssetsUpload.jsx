import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaSpinner, FaCheckCircle, FaSave } from 'react-icons/fa';
import { courseAPI } from '../services/api';
import DashboardNav from './DashboardNav';
import TeacherSidebar from '../components/TeacherSidebar';
import CourseThumbnailUpload from '../components/uploads/CourseThumbnailUpload';
import CourseVideosUpload from '../components/uploads/CourseVideosUpload';

// Valid MongoDB ObjectId: 24 hex chars.
const isValidObjectId = (id) => /^[0-9a-f]{24}$/i.test(id);

const TeacherCourseAssetsUpload = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [course, setCourse] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const refreshCourse = async () => {
    try {
      const data = await courseAPI.getCreatedCourses();
      const courses = data?.courses || [];
      const match = courses.find((c) => c.id?.toString() === courseId?.toString());
      setCourse(match || null);
    } catch {
      setCourse(null);
    }
  };

  useEffect(() => {
    const run = async () => {
      if (!courseId || !isValidObjectId(courseId)) {
        setError('Invalid course id.');
        setLoading(false);
        return;
      }

      setError('');
      setLoading(true);
      await refreshCourse();
      setLoading(false);
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const headerGradient = useMemo(() => {
    return course?.color || 'from-amber-500 to-orange-500';
  }, [course]);

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => {
      navigate('/teacher/courses');
    }, 800);
  };

  if (loading) {
    return (
      <div className="h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
        <DashboardNav activePage="/teacher/courses" />
        <div className="flex flex-1 overflow-hidden">
          <TeacherSidebar />
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center">
              <FaSpinner className="animate-spin text-4xl text-amber-500" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
        <DashboardNav activePage="/teacher/courses" />
        <div className="flex flex-1 overflow-hidden">
          <TeacherSidebar />
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-red-700 dark:text-red-400">Could not load course</h2>
                <p className="text-sm text-red-600 dark:text-red-300 mt-2">{error}</p>
                <button
                  type="button"
                  onClick={() => navigate('/teacher/courses')}
                  className="mt-5 px-4 py-2 rounded-xl font-semibold bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors"
                >
                  Back to My Courses
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      <DashboardNav activePage="/teacher/courses" />
      <div className="flex flex-1 overflow-hidden">
        <TeacherSidebar />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Course header card */}
            <div className={`rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-6`}>
              <div className={`h-28 bg-gradient-to-r ${headerGradient} p-6 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/teacher/courses')}
                    className="p-2 rounded-xl bg-white/15 hover:bg-white/25 transition-colors text-white"
                    title="Back"
                  >
                    <FaArrowLeft />
                  </button>
                  <div className="min-w-0">
                    <h1 className="text-xl font-bold text-white truncate">
                      {course?.title || 'Upload Course Assets'}
                    </h1>
                    <p className="text-white/80 text-sm truncate">
                      {course?.category ? `${course.category} · ${course.level}` : 'Thumbnail + Videos'}
                    </p>
                  </div>
                </div>
              </div>

              {course?.image ? (
                <div className="p-6 bg-white dark:bg-slate-800">
                  <img
                    src={course.image}
                    alt="Course thumbnail"
                    className="w-full max-h-56 object-cover rounded-2xl border border-slate-200 dark:border-slate-700"
                  />
                </div>
              ) : (
                <div className="p-6 bg-white dark:bg-slate-800">
                  <div className={`h-40 rounded-2xl bg-gradient-to-br ${headerGradient} flex items-center justify-center text-white font-semibold`}>
                    No thumbnail yet
                  </div>
                </div>
              )}
            </div>

            {/* Upload panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Thumbnail</h2>
                <CourseThumbnailUpload courseId={courseId} onUploaded={refreshCourse} />
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Videos</h2>
                <CourseVideosUpload courseId={courseId} onUploaded={refreshCourse} />
              </div>
            </div>

            {/* ── Save footer ── */}
            <div className="mt-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-6 py-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Uploads are saved instantly. Click <span className="font-semibold text-slate-700 dark:text-slate-200">Save &amp; Continue</span> when you're done.
              </p>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => navigate('/teacher/courses')}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Skip for now
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saveSuccess}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white
                    bg-gradient-to-r from-amber-500 to-orange-500
                    hover:from-amber-600 hover:to-orange-600
                    disabled:opacity-70 disabled:cursor-not-allowed
                    shadow-md hover:shadow-lg transition-all"
                >
                  {saveSuccess ? (
                    <>
                      <FaCheckCircle className="text-white" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <FaSave />
                      Save &amp; Continue
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherCourseAssetsUpload;
