import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { assignmentAPI, courseAPI } from '../services/api';
import DashboardNav from './DashboardNav';
import TeacherSidebar from '../components/TeacherSidebar';

import { useAuth } from '../context/AuthContext';

import {
  FaSpinner,
  FaPlus,
  FaTimes,
  FaClipboardList,
  FaCheckCircle,
  FaExclamationCircle,
  FaFileUpload,
  FaSave,
} from 'react-icons/fa';

const PageShell = ({ children, activePath }) => (
  <div className="h-screen bg-slate-50 flex flex-col">
    <DashboardNav activePage={activePath} />
    <div className="flex flex-1 overflow-hidden">
      <TeacherSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
      </main>
    </div>
  </div>
);

const safeJsonParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const TeacherAssignments = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [teacherAssignments, setTeacherAssignments] = useState([]);
  const [teacherCourses, setTeacherCourses] = useState([]);

  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Create form (MVP: JSON inputs for quiz questions / requirements)
  const [createForm, setCreateForm] = useState({
    courseId: '',
    type: 'quiz',
    title: '',
    description: '',
    dueAt: '',
    duration: '',
    points: 0,
    questionsJson: '[]',
    requirementsJson: '[]',
  });

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const activePath = '/teacher/assignments';

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [aData, cData] = await Promise.all([
        assignmentAPI.getTeacherAssignments(),
        courseAPI.getCreatedCourses(),
      ]);
      setTeacherAssignments(aData?.assignments || []);
      setTeacherCourses(cData?.courses || []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load');
      setTeacherAssignments([]);
      setTeacherCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const loadSubmissions = async (assignment) => {
    if (!assignment?.id) return;
    setSelectedAssignment(assignment);
    setLoadingSubmissions(true);
    setSubmissions([]);
    try {
      const data = await assignmentAPI.getSubmissions(assignment.id);
      setSubmissions(data?.submissions || []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load submissions');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const onChange = (k, v) => setCreateForm((p) => ({ ...p, [k]: v }));

  const handleCreate = async () => {
    setCreating(true);
    setCreateError('');
    try {
      const payload = {
        courseId: createForm.courseId,
        type: createForm.type,
        title: createForm.title,
        description: createForm.description,
        dueAt: createForm.dueAt ? new Date(createForm.dueAt).toISOString() : null,
        duration: createForm.duration,
        points: Number(createForm.points) || 0,
      };

      if (createForm.type === 'quiz') {
        const parsed = safeJsonParse(createForm.questionsJson);
        if (!Array.isArray(parsed) || parsed.length === 0) {
          throw new Error('questionsJson must be a non-empty JSON array');
        }
        payload.questions = parsed;
      } else {
        const parsed = safeJsonParse(createForm.requirementsJson);
        payload.requirements = Array.isArray(parsed) ? parsed : [];
      }

      await assignmentAPI.createAssignment(payload);

      // Reset and reload.
      setCreateForm({
        courseId: createForm.courseId,
        type: 'quiz',
        title: '',
        description: '',
        dueAt: '',
        duration: '',
        points: 0,
        questionsJson: '[]',
        requirementsJson: '[]',
      });

      await loadAll();
    } catch (err) {
      setCreateError(err?.message || 'Failed to create assignment');
    } finally {
      setCreating(false);
    }
  };

  const gradeOne = async (submissionId, grade, feedback) => {
    if (!selectedAssignment?.id || !submissionId) return;
    await assignmentAPI.gradeSubmission(selectedAssignment.id, submissionId, { grade, feedback });
    await loadSubmissions(selectedAssignment);
  };

  const courseLabel = useMemo(() => {
    const map = new Map(teacherCourses.map((c) => [String(c.id), c.title]));
    return map;
  }, [teacherCourses]);

  if (loading) {
    return (
      <PageShell activePath={activePath}>
        <div className="flex items-center justify-center py-24">
          <FaSpinner className="animate-spin text-3xl text-sky-500" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell activePath={activePath}>
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FaClipboardList className="text-sky-500" />
              Teacher Assignments
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Create quizzes/projects and grade student submissions.
            </p>
          </div>
          <div className="text-xs text-slate-400">
            Signed in as <span className="text-slate-700 font-semibold">{user?.name}</span>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl"
          >
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <FaPlus className="text-amber-500" />
                Create Assignment
              </h2>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-xs text-slate-600">Course</label>
                  <select
                    value={createForm.courseId}
                    onChange={(e) => onChange('courseId', e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
                  >
                    <option value="">Select course</option>
                    {teacherCourses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onChange('type', 'quiz')}
                    className={[
                      'flex-1 px-3 py-2 rounded-xl text-sm font-semibold border',
                      createForm.type === 'quiz'
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50',
                    ].join(' ')}
                  >
                    Quiz
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange('type', 'project')}
                    className={[
                      'flex-1 px-3 py-2 rounded-xl text-sm font-semibold border',
                      createForm.type === 'project'
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50',
                    ].join(' ')}
                  >
                    Project
                  </button>
                </div>

                <div>
                  <label className="text-xs text-slate-600">Title</label>
                  <input
                    value={createForm.title}
                    onChange={(e) => onChange('title', e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600">Points</label>
                  <input
                    type="number"
                    value={createForm.points}
                    onChange={(e) => onChange('points', e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600">Due date</label>
                  <input
                    type="date"
                    value={createForm.dueAt}
                    onChange={(e) => onChange('dueAt', e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600">Duration (display)</label>
                  <input
                    value={createForm.duration}
                    onChange={(e) => onChange('duration', e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600">Description</label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => onChange('description', e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white min-h-[80px]"
                  />
                </div>

                {createForm.type === 'quiz' ? (
                  <div>
                    <label className="text-xs text-slate-600">
                      Quiz questions JSON
                    </label>
                    <textarea
                      value={createForm.questionsJson}
                      onChange={(e) => onChange('questionsJson', e.target.value)}
                      className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white min-h-[120px] font-mono"
                      placeholder='[{"question":"...","options":["a","b"],"correctAnswer":0}]'
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Each question: <code>question</code>, <code>options</code>, <code>correctAnswer</code> (index).
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs text-slate-600">
                      Project requirements JSON
                    </label>
                    <textarea
                      value={createForm.requirementsJson}
                      onChange={(e) => onChange('requirementsJson', e.target.value)}
                      className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white min-h-[100px] font-mono"
                      placeholder='["Requirement 1","Requirement 2"]'
                    />
                  </div>
                )}

                {createError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-xl">
                    {createError}
                  </div>
                )}

                <button
                  type="button"
                  disabled={creating}
                  onClick={handleCreate}
                  className="w-full py-2.5 rounded-xl font-bold transition-all bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-60"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <FaClipboardList className="text-indigo-500" />
                Your Assignments
              </h2>

              <div className="mt-4 space-y-3">
                {teacherAssignments.length === 0 ? (
                  <div className="text-sm text-slate-500">
                    No assignments yet. Create one on the left.
                  </div>
                ) : (
                  teacherAssignments.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => loadSubmissions(a)}
                      className={[
                        'w-full text-left p-4 rounded-xl border transition-colors',
                        selectedAssignment?.id === a.id
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-white border-slate-200 hover:bg-slate-50',
                      ].join(' ')}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-slate-900">{a.title}</div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {courseLabel.get(String(a.courseId || a.courseId)) || a.course} · {a.type}
                          </div>
                        </div>
                        <div className="text-xs text-slate-500">
                          {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'No due date'}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-bold text-slate-900">
                  Submissions
                </h2>
                {selectedAssignment ? (
                  <div className="text-xs text-slate-500">
                    {selectedAssignment.type.toUpperCase()}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400">Select an assignment</div>
                )}
              </div>

              {!selectedAssignment ? (
                <div className="mt-4 text-sm text-slate-500">
                  Pick an assignment above to see and grade submissions.
                </div>
              ) : loadingSubmissions ? (
                <div className="mt-4 flex items-center gap-3">
                  <FaSpinner className="animate-spin text-sky-500" />
                  Loading submissions...
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {submissions.length === 0 ? (
                    <div className="text-sm text-slate-500">No submissions yet.</div>
                  ) : (
                    submissions.map((s) => (
                      <div key={s.id} className="border border-slate-200 rounded-xl p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold text-slate-900">
                              {s.student}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              Status: {s.status}
                              {s.submittedAt ? ` · ${new Date(s.submittedAt).toLocaleDateString()}` : ''}
                            </div>
                          </div>
                          {s.file ? (
                            <a
                              href={s.file}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-blue-600 hover:underline"
                            >
                              Open file
                            </a>
                          ) : null}
                        </div>

                        {selectedAssignment.type === 'project' ? (
                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-slate-600">Grade</label>
                              <input
                                type="number"
                                defaultValue={s.score ?? ''}
                                className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
                                onChange={(e) => {
                                  s._gradeDraft = e.target.value;
                                }}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-slate-600">Feedback</label>
                              <textarea
                                defaultValue={s.feedback ?? ''}
                                className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white min-h-[70px]"
                                onChange={(e) => {
                                  s._feedbackDraft = e.target.value;
                                }}
                              />
                            </div>
                            <button
                              type="button"
                              className="sm:col-span-2 w-full py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
                              onClick={() =>
                                gradeOne(
                                  s.id,
                                  Number(s._gradeDraft ?? s.score ?? 0),
                                  s._feedbackDraft ?? s.feedback ?? ''
                                )
                              }
                            >
                              <FaCheckCircle />
                              Grade
                            </button>
                          </div>
                        ) : (
                          <div className="mt-3">
                            <div className="text-sm text-slate-600">
                              Score: {s.score ?? 0} / {selectedAssignment.points ?? 0}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default TeacherAssignments;

