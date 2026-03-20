import { useMemo, useRef, useState } from 'react';
import { FaCamera, FaSpinner, FaCheck } from 'react-icons/fa';
import { authAPI } from '../../services/api';

const CloudinaryAvatarUpload = ({ user, onUserUpdated }) => {
  const fileInputRef = useRef(null);

  const [previewSrc, setPreviewSrc] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const avatarSrc = previewSrc || user?.avatar || '';
  const avatarInitial = useMemo(
    () => user?.name?.charAt(0)?.toUpperCase() || 'U',
    [user?.name]
  );

  const processFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    setError('');
    setSuccess(false);
    setPreviewSrc(URL.createObjectURL(file));
    setLoading(true);
    try {
      const updatedUser = await authAPI.uploadAvatar(file);
      onUserUpdated(updatedUser);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to upload avatar');
      setPreviewSrc('');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e) => processFile(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    processFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div className="flex flex-col items-center gap-2 mb-2">
      {/* Avatar + overlay button */}
      <div
        className={`relative inline-block cursor-pointer group`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !loading && fileInputRef.current?.click()}
        title="Click or drag an image to update your photo"
      >
        {/* Ring — pulses on drag, success turns green */}
        <div className={`w-20 h-20 rounded-full transition-all duration-200
          ${dragOver ? 'ring-4 ring-primary-400 ring-offset-2 scale-105' : ''}
          ${success ? 'ring-4 ring-emerald-400 ring-offset-2' : ''}
          ${!dragOver && !success ? 'ring-4 ring-primary-100 dark:ring-primary-900/30' : ''}
        `}>
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
            {avatarSrc ? (
              <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              avatarInitial
            )}
          </div>
        </div>

        {/* Hover / drag overlay */}
        <div className={`absolute inset-0 rounded-full flex items-center justify-center transition-opacity duration-200
          ${dragOver ? 'opacity-100 bg-primary-600/60' : 'opacity-0 group-hover:opacity-100 bg-black/40'}
          ${loading ? 'opacity-100 bg-black/50' : ''}
        `}>
          {loading
            ? <FaSpinner className="text-white text-lg animate-spin" />
            : success
            ? <FaCheck className="text-white text-lg" />
            : <FaCamera className="text-white text-lg" />
          }
        </div>

        {/* Small camera badge */}
        {!loading && (
          <div className={`absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center shadow-lg transition-colors
            ${success ? 'bg-emerald-500' : 'bg-primary-600 group-hover:bg-primary-700'}
          `}>
            {success ? <FaCheck className="text-white text-[11px]" /> : <FaCamera className="text-white text-[11px]" />}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Hint text */}
      <p className="text-[11px] text-slate-400 dark:text-slate-500">
        {dragOver ? 'Drop to upload' : 'Click or drag to change photo'}
      </p>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 dark:text-red-400 text-center max-w-[180px]">{error}</p>
      )}
    </div>
  );
};

export default CloudinaryAvatarUpload;
