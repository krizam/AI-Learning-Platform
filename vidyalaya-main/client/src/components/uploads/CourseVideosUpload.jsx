import { useCallback, useMemo, useRef, useState } from 'react';
import { FaVideo, FaSpinner, FaTimes, FaCheck, FaExclamationCircle, FaCloudUploadAlt } from 'react-icons/fa';
import { courseAPI } from '../../services/api';
import UploadProgressBar from './UploadProgressBar';

const stripExtension = (name = '') => name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ').trim();
const formatBytes = (b) => {
  if (!b) return '';
  return b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`;
};

/* ── Single video item card ─────────────────────────────────────── */
const VideoItem = ({ item, onTitleChange, onRemove, disabled }) => {
  const statusConfig = {
    pending:   { label: formatBytes(item.file.size), pill: 'bg-slate-100 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400' },
    uploading: { label: 'Uploading…',                pill: 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' },
    done:      { label: '✓ Done',                    pill: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' },
    error:     { label: 'Failed',                    pill: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' },
  };
  const cfg = statusConfig[item.status] || statusConfig.pending;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800 transition-all">
      {/* Header row */}
      <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-slate-100 dark:border-slate-700/60">
        <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/30 flex items-center justify-center shrink-0">
          <FaVideo className="text-[11px] text-violet-500 dark:text-violet-400" />
        </div>
        <p className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate flex-1 min-w-0">
          {item.file.name}
        </p>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${cfg.pill}`}>
          {cfg.label}
        </span>
        {item.status !== 'uploading' && item.status !== 'done' && (
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            disabled={disabled}
            className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0 disabled:opacity-40"
          >
            <FaTimes className="text-[10px]" />
          </button>
        )}
      </div>

      {/* Body: title input + progress */}
      <div className="px-3 py-2.5 space-y-2">
        <input
          type="text"
          value={item.title}
          onChange={(e) => onTitleChange(item.id, e.target.value)}
          disabled={disabled || item.status === 'uploading' || item.status === 'done'}
          placeholder="Video title…"
          maxLength={200}
          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        />

        {(item.status === 'uploading' || item.status === 'done') && (
          <UploadProgressBar
            progress={item.status === 'done' ? 100 : item.progress}
            label={item.status === 'done' ? 'Uploaded' : 'Uploading…'}
          />
        )}

        {item.status === 'error' && (
          <p className="text-[11px] text-red-500 dark:text-red-400 flex items-center gap-1">
            <FaExclamationCircle className="text-[10px]" />
            {item.error || 'Upload failed — will retry on next upload.'}
          </p>
        )}
      </div>
    </div>
  );
};

/* ── Main component ─────────────────────────────────────────────── */
const CourseVideosUpload = ({ courseId, onUploaded, maxVideos = 10 }) => {
  const inputRef = useRef(null);
  const [items, setItems] = useState([]);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const addFiles = useCallback((files) => {
    setError('');
    setItems((prev) => {
      const remaining = Math.max(0, maxVideos - prev.length);
      const next = files.slice(0, remaining).map((file) => ({
        id: `${file.name}_${file.size}_${Date.now()}_${Math.random()}`,
        file,
        title: stripExtension(file.name).slice(0, 200) || 'Untitled',
        progress: 0,
        status: 'pending',
        error: '',
      }));
      return [...prev, ...next];
    });
  }, [maxVideos]);

  const handleInput = (e) => {
    addFiles(Array.from(e.target.files || []));
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('video/'));
    if (files.length) addFiles(files);
  };

  const updateItem = (id, patch) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  const removeItem = (id) =>
    setItems((prev) => prev.filter((it) => it.id !== id));

  const handleUploadAll = async () => {
    if (!courseId || !items.length) return;
    setBulkUploading(true);
    setError('');

    for (const it of items) {
      if (it.status === 'done') continue;
      updateItem(it.id, { status: 'uploading', progress: 0, error: '' });
      try {
        await courseAPI.uploadCourseVideo(courseId, it.file, {
          title: it.title,
          onUploadProgress: (evt) => {
            const pct = evt.total ? Math.round((evt.loaded / evt.total) * 100) : 0;
            updateItem(it.id, { progress: pct });
          },
        });
        updateItem(it.id, { status: 'done', progress: 100 });
        onUploaded?.();
      } catch (err) {
        updateItem(it.id, {
          status: 'error',
          progress: 0,
          error: err.response?.data?.message || err.message || 'Video upload failed',
        });
        setError('One or more videos failed. They will retry on next upload.');
      }
    }
    setBulkUploading(false);
  };

  const pendingCount = useMemo(() => items.filter((it) => it.status === 'pending' || it.status === 'error').length, [items]);
  const doneCount    = useMemo(() => items.filter((it) => it.status === 'done').length, [items]);
  const canUpload    = !!courseId && pendingCount > 0 && !bulkUploading;

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
          <FaVideo className="text-xs text-violet-600 dark:text-violet-400" />
        </div>
        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Course Videos</h4>
        {doneCount > 0 && (
          <span className="ml-auto text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full flex items-center gap-1">
            <FaCheck className="text-[10px]" /> {doneCount} uploaded
          </span>
        )}
        {items.length === 0 && (
          <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">
            Up to {maxVideos} files
          </span>
        )}
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !bulkUploading && inputRef.current?.click()}
        className={`flex flex-col items-center gap-2.5 rounded-2xl border-2 border-dashed p-5 cursor-pointer transition-all duration-200 select-none
          ${bulkUploading ? 'opacity-50 cursor-not-allowed' : ''}
          ${dragOver
            ? 'border-violet-400 bg-violet-50 dark:bg-violet-900/10 scale-[1.01]'
            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:border-violet-300 hover:bg-violet-50/40 dark:hover:bg-violet-900/5'
          }`}
      >
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors
          ${dragOver ? 'bg-violet-100 dark:bg-violet-900/30' : 'bg-white dark:bg-slate-700 shadow-sm border border-slate-100 dark:border-slate-600'}`}>
          <FaVideo className={`text-xl ${dragOver ? 'text-violet-500' : 'text-slate-300 dark:text-slate-500'}`} />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Drop videos here or <span className="text-violet-600 dark:text-violet-400">browse</span>
          </p>
          <p className="text-xs text-slate-400 mt-0.5">MP4, MOV, WEBM · Multiple files supported</p>
        </div>
        <input ref={inputRef} type="file" accept="video/*" multiple onChange={handleInput} className="hidden" disabled={bulkUploading} />
      </div>

      {/* Video list */}
      {items.length > 0 && (
        <div className="space-y-2 max-h-[38vh] overflow-y-auto pr-0.5">
          {items.map((it) => (
            <VideoItem
              key={it.id}
              item={it}
              onTitleChange={(id, val) => updateItem(id, { title: val })}
              onRemove={removeItem}
              disabled={bulkUploading}
            />
          ))}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1.5">
          <FaExclamationCircle className="text-[10px]" /> {error}
        </p>
      )}

      {/* Upload button — only shown when there are videos */}
      {items.length > 0 && (
        <button
          type="button"
          onClick={handleUploadAll}
          disabled={!canUpload}
          className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all
            bg-gradient-to-r from-violet-600 to-primary-600 hover:from-violet-700 hover:to-primary-700
            text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {bulkUploading ? (
            <><FaSpinner className="animate-spin" /> Uploading…</>
          ) : (
            <><FaCloudUploadAlt /> Upload {pendingCount} video{pendingCount !== 1 ? 's' : ''}</>
          )}
        </button>
      )}

      {doneCount > 0 && pendingCount > 0 && !bulkUploading && (
        <p className="text-center text-xs text-slate-400">
          {doneCount} uploaded · {pendingCount} queued
        </p>
      )}
    </div>
  );
};

export default CourseVideosUpload;
