import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StudentShell from '../components/StudentShell';
import { courseAPI } from '../services/api';
import {
  FaChevronLeft,
  FaClock,
  FaLock,
  FaSpinner,
} from 'react-icons/fa';

// Valid MongoDB ObjectId: 24 hex chars.
const isValidObjectId = (id) => /^[0-9a-f]{24}$/i.test(id);

const CourseLearning = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [course, setCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [canWatch, setCanWatch] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const fetchLearning = async () => {
      if (!courseId) return;

      if (!isValidObjectId(courseId)) {
        setError('Invalid course id.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const data = await courseAPI.getCourseLearning(courseId);
        setCourse(data.course || null);
        setCanWatch(Boolean(data.access?.canWatch));
        setVideos(data.videos || []);
        setSelectedIndex(0);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load learning content');
      } finally {
        setLoading(false);
      }
    };

    fetchLearning();
  }, [courseId]);

  const selectedVideo = useMemo(() => {
    if (!videos.length) return null;
    return videos[Math.max(0, Math.min(selectedIndex, videos.length - 1))];
  }, [videos, selectedIndex]);

  if (loading) {
    return (
      <StudentShell>
        <div className="min-h-screen flex items-center justify-center">
          <FaSpinner className="animate-spin text-4xl text-primary-500" />
        </div>
      </StudentShell>
    );
  }

  return (
    <StudentShell>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-sky-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="bg-white dark:bg-slate-800 shadow-lg border-b-4 border-blue-400">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/student/my-courses')}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  type="button"
                >
                  <FaChevronLeft className="text-slate-600 dark:text-slate-300" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {course?.title || 'Course'}
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    by {course?.instructor || '—'}
                  </p>
                </div>
              </div>

              {course?.duration ? (
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <FaClock />
                  <span>{course.duration}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6">
          {error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400">
              {error}
            </div>
          ) : null}

          {!canWatch ? (
            <div className="mt-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900/40 flex items-center justify-center">
                  <FaLock className="text-slate-700 dark:text-slate-200" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Locked content</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    You can watch this course only after teacher approval (free) and payment verification (paid).
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate(`/course/${courseId}`)}
                    className="mt-4 px-5 py-2.5 rounded-lg font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                  >
                    Back to Course
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-blue-200 dark:border-blue-900">
                  {selectedVideo ? (
                    <div className="aspect-video bg-slate-900">
                      <video
                        className="w-full h-full"
                        src={selectedVideo.url}
                        controls
                        preload="metadata"
                        poster={course?.thumbnail || undefined}
                      />
                    </div>
                  ) : (
                    <div className="p-10 text-center text-slate-600 dark:text-slate-300">
                      No videos uploaded yet.
                    </div>
                  )}

                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                      {selectedVideo?.title || 'Select a video'}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {videos.length} video{videos.length !== 1 ? 's' : ''} in this course
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-blue-200 dark:border-blue-900 sticky top-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                    Course Videos
                  </h3>
                  <div className="space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
                    {videos.map((v, idx) => {
                      const active = idx === selectedIndex;
                      return (
                        <button
                          key={v.public_id || v.url || idx}
                          type="button"
                          onClick={() => setSelectedIndex(idx)}
                          className={`w-full text-left px-3 py-3 rounded-xl transition-all ${
                            active
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                              : 'bg-slate-50 dark:bg-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-700/40 text-slate-900 dark:text-white'
                          }`}
                        >
                          <div className="font-semibold text-sm">{v.title}</div>
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