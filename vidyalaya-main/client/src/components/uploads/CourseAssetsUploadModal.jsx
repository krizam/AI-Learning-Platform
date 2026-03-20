import { FaTimes } from 'react-icons/fa';
import CourseThumbnailUpload from './CourseThumbnailUpload';
import CourseVideosUpload from './CourseVideosUpload';

const CourseAssetsUploadModal = ({ course, onClose, onAssetsUploaded }) => {
  if (!course) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700/60 w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Upload Course Assets
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
              {course.title}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-4 shrink-0"
          >
            <FaTimes />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <CourseThumbnailUpload
            courseId={course.id}
            onUploaded={onAssetsUploaded}
          />

          {/* Divider */}
          <div className="border-t border-slate-100 dark:border-slate-800" />

          <CourseVideosUpload
            courseId={course.id}
            onUploaded={onAssetsUploaded}
          />
        </div>
      </div>
    </div>
  );
};

export default CourseAssetsUploadModal;
