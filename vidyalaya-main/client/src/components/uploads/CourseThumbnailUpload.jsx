import { useCallback, useRef, useState } from 'react';
import { FaImage, FaSpinner, FaTimes, FaCheck } from 'react-icons/fa';
import { courseAPI } from '../../services/api';
import UploadProgressBar from './UploadProgressBar';

const formatBytes = (b) => {
  if (!b) return '';
  return b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`;
};

const CourseThumbnailUpload = ({ courseId, onUploaded }) => {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [previewSrc, setPreviewSrc] = useState('');
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const pickFile = useCallback((f) => {
    if (!f) return;
    setError('');
    setProgress(0);
    setUploaded(false);
    setFile(f);
    setPreviewSrc(URL.createObjectURL(f));
  }, []);

  const handleInput = (e) => { pickFile(e.target.files?.[0]); e.target.value = ''; };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = Array.from(e.dataTransfer.files).find((x) => x.type.startsWith('image/'));
    if (f) pickFile(f);
  };

  const handleUpload = async () => {
    if (!courseId || !file) return;
    setUploading(true);
    setError('');
    setProgress(0);
    try {
      await courseAPI.uploadCourseThumbnail(courseId, file, {
        onUploadProgress: (evt) => {
          setProgress(evt.total ? Math.round((evt.loaded / evt.total) * 100) : 0);
        },
      });
      setProgress(100);
      setUploaded(true);
      onUploaded?.();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to upload thumbnail');
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => { setFile(null); setPreviewSrc(''); setProgress(0); setUploaded(false); setError(''); };

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <FaImage className="text-xs text-amber-600 dark:text-amber-400" />
        </div>
        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Course Thumbnail</h4>
        {uploaded && (
          <span className="ml-auto flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
            <FaCheck className="text-[10px]" /> Uploaded
          </span>
        )}
      </div>

      {!file ? (
        /* Drop zone */
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center gap-2.5 rounded-2xl border-2 border-dashed p-6 cursor-pointer transition-all duration-200 select-none
            ${dragOver
              ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/10 scale-[1.01]'
              : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:border-amber-300 hover:bg-amber-50/40 dark:hover:bg-amber-900/5'
            }`}
        >
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors
            ${dragOver ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-white dark:bg-slate-700 shadow-sm border border-slate-100 dark:border-slate-600'}`}>
            <FaImage className={`text-xl ${dragOver ? 'text-amber-500' : 'text-slate-300 dark:text-slate-500'}`} />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Drop image here or <span className="text-amber-600 dark:text-amber-400">browse</span>
            </p>
            <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, WEBP · Max 5 MB</p>
          </div>
          <input ref={inputRef} type="file" accept="image/*" onChange={handleInput} className="hidden" />
        </div>
      ) : (
        /* Preview card */
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800">
          {/* Image strip */}
          <div className="relative h-36 bg-slate-100 dark:bg-slate-900 group">
            <img src={previewSrc} alt="thumbnail preview" className="w-full h-full object-cover" />
            {!uploaded && !uploading && (
              <button
                type="button"
                onClick={clearFile}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
              >
                <FaTimes className="text-white text-xs" />
              </button>
            )}
            {uploaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                  <FaCheck className="text-white" />
                </div>
              </div>
            )}
          </div>

          {/* Meta row */}
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">{file.name}</p>
              <p className="text-xs text-slate-400">{formatBytes(file.size)}</p>
            </div>

            {uploaded ? (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <FaCheck className="text-[10px]" /> Done
              </span>
            ) : uploading ? (
              <div className="flex items-center gap-1.5 text-xs text-primary-500">
                <FaSpinner className="animate-spin text-[10px]" />
                <span className="font-semibold">{progress}%</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleUpload}
                className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white transition-all shadow-sm"
              >
                Upload
              </button>
            )}
          </div>

          {/* Progress */}
          {(uploading || uploaded) && (
            <div className="px-4 pb-3">
              <UploadProgressBar
                progress={uploaded ? 100 : progress}
                label={uploaded ? 'Uploaded' : 'Uploading thumbnail…'}
                variant="thumbnail"
              />
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1.5">
          ⚠ {error}
        </p>
      )}
    </div>
  );
};

export default CourseThumbnailUpload;
