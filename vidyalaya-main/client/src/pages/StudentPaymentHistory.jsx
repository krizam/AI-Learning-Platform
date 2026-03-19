import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentAPI } from '../services/api';
import StudentShell from '../components/StudentShell';
import {
  FaSpinner,
  FaReceipt,
  FaExternalLinkAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
} from 'react-icons/fa';

// Student Payment History page (dedicated sidebar tab)
// - Lists the logged-in student's payments using existing Khalti payment records
// - Allows downloading a PDF receipt per completed payment
const StudentPaymentHistory = () => {
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [error, setError] = useState('');

  const statusMeta = useMemo(
    () => ({
      completed: { label: 'Completed', icon: FaCheckCircle, pill: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
      pending: { label: 'Pending', icon: FaClock, pill: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
      failed: { label: 'Failed', icon: FaTimesCircle, pill: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
    }),
    []
  );

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await paymentAPI.history();
        setPayments(data.payments || []);
      } catch (err) {
        setPayments([]);
        setError(err.response?.data?.message || 'Failed to load payment history');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const downloadReceipt = async (payment) => {
    try {
      setDownloadingId(payment._id);
      const blob = await paymentAPI.downloadReceipt(payment._id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vidyalaya-receipt-${payment.transactionId || payment.pidx || payment._id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <StudentShell>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Payment History</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              All payments you made for paid courses (Khalti).
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <FaSpinner className="text-2xl text-primary-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12 text-sm text-slate-500 dark:text-slate-400">
            No payments found yet.
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((p) => {
              const meta = statusMeta[p.status] || statusMeta.pending;
              const StatusIcon = meta.icon;
              const paidDate = p.paidAt || p.updatedAt || p.createdAt;

              return (
                <div
                  key={p._id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/40"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {p.course?.title || 'Course'}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span>Amount: NPR {Number(p.amount || 0).toLocaleString()}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold ${meta.pill}`}>
                        <StatusIcon className="text-[11px]" />
                        <span>{meta.label}</span>
                      </span>
                      {paidDate && <span>Date: {new Date(paidDate).toLocaleString()}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => p.course?._id && navigate(`/course/${p.course._id}`)}
                      className="px-3 py-2 rounded-lg text-sm font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors inline-flex items-center gap-2"
                    >
                      <FaExternalLinkAlt className="text-xs" />
                      View course
                    </button>

                    <button
                      disabled={p.status !== 'completed' || downloadingId === p._id}
                      onClick={() => downloadReceipt(p)}
                      className="px-3 py-2 rounded-lg text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
                      title={p.status !== 'completed' ? 'Receipt is available only for completed payments' : 'Download receipt PDF'}
                    >
                      {downloadingId === p._id ? <FaSpinner className="animate-spin" /> : <FaReceipt />}
                      Download PDF
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StudentShell>
  );
};

export default StudentPaymentHistory;

