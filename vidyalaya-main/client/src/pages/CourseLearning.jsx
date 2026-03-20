// CourseLearning.jsx

// ── React & routing ───────────────────────────────────────────────────────────
import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// ── Layout shell & API ────────────────────────────────────────────────────────
import StudentShell from '../components/StudentShell';
import { courseAPI } from '../services/api';

// ── Icons (react-icons/fa only) ───────────────────────────────────────────────
import {
  FaChevronLeft,
  FaClock,
  FaLock,
  FaSpinner,
  FaPlay,
  FaExclamationCircle,
  FaFilm,
} from 'react-icons/fa';

// ─────────────────────────────────────────────────────────────────────────────
// Validates a MongoDB ObjectId (24 hex characters).
// Checked before hitting the API to give instant client-side feedback.
// ─────────────────────────────────────────────────────────────────────────────
const isValidObjectId = (id) => /^[0-9a-f]{24}$/i.test(id);

// =============================================================================
// CourseLearning — video player + playlist for a single enrolled course
// =============================================================================
const CourseLearning = () => {
  const { courseId } = useParams();
  const navigate     = useNavigate();

  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [course,        setCourse]        = useState(null);
  const [videos,        setVideos]        = useState([]);
  const [canWatch,      setCanWatch]      = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Fetch course data + access check on mount / courseId change
  useEffect(() => {
    const fetchLearning = async () => {
      if (!courseId) return;

      // Guard against malformed IDs before making a network request
      if (!isValidObjectId(courseId)) {
        setError('Invalid course ID.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const data = await courseAPI.getCourseLearning(courseId);
        setCourse(data.course   || null);
        setCanWatch(Boolean(data.access?.canWatch));
        setVideos(data.videos   || []);
        setSelectedIndex(0);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load learning content');
      } finally {
        setLoading(false);
      }
    };

    fetchLearning();
  }, [courseId]);

  // Clamp selectedIndex to valid range whenever videos array changes
  const selectedVideo = useMemo(() => {
    if (!videos.length) return null;
    return videos[Math.max(0, Math.min(selectedIndex, videos.length - 1))];
  }, [videos, selectedIndex]);

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

  // ── Main render ─────────────────────────────────────────────────────────────
  return (
    <StudentShell>
      <div className="bg-slate-50 min-h-full">

        {/* ── Course header bar ─────────────────────────────────────────────── */}
        <div className="bg-white shadow-sm border-b-2 border-blue-500 mb-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between gap-4">

              <div className="flex items-center space-x-3 min-w-0">
                {/* Back to My Courses */}
                <button
                  type="button"
                  onClick={() => navigate('/my-courses')}
                  aria-label="Back to My Courses"
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 flex-shrink-0"
                >
                  <FaChevronLeft className="text-slate-600" />
                </button>

                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
                    {course?.title || 'Course'}
                  </h1>
                  <p className="text-sm text-slate-500">
                    by {course?.instructor || '—'}
                  </p>
                </div>
              </div>

              {/* Duration badge — only rendered when the API provides it */}
              {course?.duration && (
                <div className="flex items-center gap-1.5 text-sm text-slate-500 flex-shrink-0">
                  <FaClock className="text-blue-400" />
                  <span>{course.duration}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Page content ──────────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-10">

          {/* Error banner */}
          {error && (
            <div
              role="alert"
              className="mb-6 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm"
            >
              <FaExclamationCircle className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ── Locked state ──────────────────────────────────────────────── */}
          {!canWatch && (
            <div className="mt-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <FaLock className="text-slate-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">Content Locked</h2>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    You can watch this course only after teacher approval (free courses) or payment
                    verification (paid courses).
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate(`/course/${courseId}`)}
                    className="mt-4 px-5 py-2.5 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                  >
                    Back to Course
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Player + Playlist ─────────────────────────────────────────── */}
          {canWatch && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Left — video player */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">

                  {/* Video element or empty state */}
                  {selectedVideo ? (
                    <div className="aspect-video bg-slate-900">
                      <video
                        key={selectedVideo.url}
                        className="w-full h-full"
                        src={selectedVideo.url}
                        controls
                        preload="metadata"
                        poster={course?.thumbnail || undefined}
                      />
                    </div>
                  ) : (
                    /* No videos have been uploaded by the teacher yet */
                    <div className="aspect-video bg-slate-100 flex flex-col items-center justify-center gap-3 text-slate-400">
                      <FaFilm className="text-4xl text-slate-300" />
                      <p className="text-sm">No videos uploaded yet.</p>
                    </div>
                  )}

                  {/* Video title + count */}
                  <div className="p-5 border-t border-slate-100">
                    <h2 className="text-lg font-bold text-slate-900 mb-1">
                      {selectedVideo?.title || 'Select a video from the playlist'}
                    </h2>
                    <p className="text-sm text-slate-400">
                      {videos.length} video{videos.length !== 1 ? 's' : ''} in this course
                    </p>
                  </div>
                </div>
              </div>

              {/* Right — video playlist */}
              <div className="lg:col-span-1">
                {/* sticky top accounts for the DashboardNav height (~64px) */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sticky top-20">
                  <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <FaFilm className="text-blue-500 text-sm" />
                    Course Videos
                  </h3>

                  <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                    {videos.map((v, idx) => {
                      const active = idx === selectedIndex;
                      return (
                        <button
                          key={v.public_id || v.url || idx}
                          type="button"
                          onClick={() => setSelectedIndex(idx)}
                          aria-current={active ? 'true' : undefined}
                          aria-label={`Play video ${idx + 1}: ${v.title}`}
                          className={[
                            'w-full text-left px-3 py-3 rounded-xl transition-all flex items-center gap-3',
                            'focus:outline-none focus:ring-2 focus:ring-blue-400',
                            active
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-800',
                          ].join(' ')}
                        >
                          {/* Video number badge */}
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                              active ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {active ? <FaPlay className="text-[8px]" /> : idx + 1}
                          </span>
                          <span className="text-sm font-medium truncate">{v.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </StudentShell>
  );
};

export default CourseLearning;
