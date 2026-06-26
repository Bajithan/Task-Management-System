import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTaskById, updateTask, updateTaskStatus, deleteTask } from '../../api/tasksApi';
import { getProjectNames } from '../../api/projectsApi';
import usersApi from '../../api/usersApi';
import { useAuth } from '../../context/AuthContext';
import { useWebSocket } from '../../hooks/useWebSocket';
import CommentSection from '../../components/comments/CommentSection';
import { theme, statusColor, priorityColor } from '../../styles/theme';

const STATUSES = ['To Do', 'In Progress', 'Completed'];

const TaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isCollaborator = user?.role === 'Collaborator';

  const [task, setTask] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [assigneeName, setAssigneeName] = useState('Unassigned');
  const [assignableUsers, setAssignableUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editForm, setEditForm] = useState(null);

  const isAssignee = task?.assigned_to === user?.user_id;
  const isUnassigned = !task?.assigned_to;
  const canUpdateStatus =
    user?.role === 'Admin' ||
    isAssignee ||
    (user?.role === 'Project Manager' && isUnassigned);

  useEffect(() => { fetchData(); }, [id]);

  const { socket } = useWebSocket();

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      fetchData();
    };

    socket.on('task-assigned', handleUpdate);
    socket.on('status-changed', handleUpdate);
    socket.on('task-updated', handleUpdate);

    return () => {
      socket.off('task-assigned', handleUpdate);
      socket.off('status-changed', handleUpdate);
      socket.off('task-updated', handleUpdate);
    };
  }, [socket, id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: taskData } = await getTaskById(id);
      setTask(taskData);
      setEditForm({
        title: taskData.title,
        description: taskData.description || '',
        priority: taskData.priority,
        due_date: taskData.due_date || '',
        assigned_to: taskData.assigned_to || '',
      });

      try {
        const { data: projects } = await getProjectNames();
        const p = projects.find((p) => p.project_id === taskData.project_id);
        setProjectName(p ? p.name : '');
      } catch { setProjectName(''); }

      try {
        const { data: users } = await usersApi.getAssignableUsers();
        setAssignableUsers(users);
        const a = users.find((u) => u.user_id === taskData.assigned_to);
        setAssigneeName(a ? `${a.first_name} ${a.last_name}` : 'Unassigned');
      } catch { setAssigneeName('Unassigned'); }

    } catch {
      setError('Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateTaskStatus(id, newStatus);
      setTask({ ...task, status: newStatus });
      setSuccess('Status updated');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await updateTask(id, {
        ...editForm,
        assigned_to: editForm.assigned_to || null,
        due_date: editForm.due_date || null,
      });
      setSuccess('Task updated');
      setTimeout(() => setSuccess(''), 2000);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update task');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this task? This cannot be undone.')) return;
    try {
      await deleteTask(id);
      navigate(-1);
    } catch {
      setError('Failed to delete task');
    }
  };

  if (loading) return <div style={s.loading}>Loading task...</div>;
  if (!task) return <div style={s.alertError}>Task not found</div>;

  return (
    <div style={s.page}>
      <button style={s.backBtn} onClick={() => navigate(-1)}>← Back</button>

      {error && <div style={s.alertError}>{error}</div>}
      {success && <div style={s.alertSuccess}>{success}</div>}

      <div style={s.topRow}>
        <div style={s.titleBlock}>
          <h1 style={s.title}>{task.title}</h1>
          <div style={s.titleMeta}>
            {projectName && <span style={s.projectTag}>{projectName}</span>}
            <span style={{ ...s.statusChip, color: statusColor(task.status), backgroundColor: `${statusColor(task.status)}14` }}>
              {task.status}
            </span>
          </div>
        </div>
        {!isCollaborator && (
          <button style={s.deleteBtn} onClick={handleDelete}>Delete task</button>
        )}
      </div>

      {task.description && <p style={s.description}>{task.description}</p>}

      <div style={s.grid}>
        <div style={s.mainCol}>
          <div style={s.card}>
            <h2 style={s.cardTitle}>Update status</h2>
            {!canUpdateStatus && (
              <div style={s.statusNotice}>
                {task.assigned_to
                  ? '⚠️ Only the assigned person can update the status of this task.'
                  : '⚠️ This task is unassigned. Only Project Managers can update its status.'
                }
              </div>
            )}
            <div style={s.statusRow}>
              {STATUSES.map((st) => (
                <button
                  key={st}
                  style={{
                    ...(task.status === st ? s.statusBtnActive : s.statusBtn),
                    ...(!canUpdateStatus ? { cursor: 'not-allowed', opacity: 0.6 } : {})
                  }}
                  onClick={() => canUpdateStatus && handleStatusChange(st)}
                  disabled={!canUpdateStatus}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {!isCollaborator && editForm && (
            <div style={s.card}>
              <h2 style={s.cardTitle}>Edit task</h2>
              <form onSubmit={handleSave}>
                <Field label="Title">
                  <input style={s.input} value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} required />
                </Field>
                <Field label="Description">
                  <textarea style={{ ...s.input, minHeight: '80px' }} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                </Field>
                <div style={s.formRow}>
                  <Field label="Priority">
                    <select style={s.input} value={editForm.priority} onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </Field>
                  <Field label="Due date">
                    <input
                      type="date"
                      min={(() => {
                        const d = new Date();
                        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                      })()}
                      style={s.input}
                      value={editForm.due_date}
                      onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
                    />
                  </Field>
                </div>
                <Field label="Assign to">
                  <select style={s.input} value={editForm.assigned_to} onChange={(e) => setEditForm({ ...editForm, assigned_to: e.target.value })}>
                    <option value="">Unassigned</option>
                    {assignableUsers.map((u) => (
                      <option key={u.user_id} value={u.user_id}>{u.first_name} {u.last_name} ({u.role})</option>
                    ))}
                  </select>
                </Field>
                <button type="submit" style={s.saveBtn} disabled={saving}>
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </form>
            </div>
          )}

          <div style={s.card}>
            <CommentSection taskId={task.task_id} />
          </div>
        </div>

        <div style={s.sideCol}>
          <div style={s.card}>
            <h2 style={s.cardTitle}>Task details</h2>

            <DetailRow label="Priority">
              <span style={{ color: priorityColor(task.priority), fontWeight: 600, fontSize: '13.5px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: priorityColor(task.priority) }} />
                {task.priority}
              </span>
              {isCollaborator && <span style={s.readOnly}>Read-only</span>}
            </DetailRow>

            <DetailRow label="Assignee">
              <span style={s.detailValue}>{assigneeName}</span>
              {isCollaborator && <span style={s.readOnly}>Read-only</span>}
            </DetailRow>

            <DetailRow label="Due date">
              <span style={s.detailValue}>
                {task.due_date ? new Date(task.due_date).toLocaleDateString() : '—'}
              </span>
            </DetailRow>

            <DetailRow label="Created">
              <span style={{ ...s.detailValue, fontFamily: theme.font.mono, fontSize: '12px' }}>
                {new Date(task.created_at).toLocaleDateString()}
              </span>
            </DetailRow>
          </div>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div style={s.field}><label style={s.label}>{label}</label>{children}</div>
);

const DetailRow = ({ label, children }) => (
  <div style={s.detailRow}>
    <span style={s.detailLabel}>{label}</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{children}</div>
  </div>
);

const s = {
  page: { padding: '28px 28px', width: '100%', boxSizing: 'border-box' },
  backBtn: { background: 'none', border: 'none', color: theme.color.accent, cursor: 'pointer', fontSize: '13.5px', padding: 0, marginBottom: '16px', fontFamily: theme.font.body, fontWeight: 500 },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '8px' },
  titleBlock: { flex: 1 },
  title: { fontSize: '20px', fontWeight: 700, color: theme.color.ink, margin: '0 0 8px 0', fontFamily: theme.font.body, letterSpacing: '-0.01em' },
  titleMeta: { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' },
  projectTag: { fontSize: '12px', backgroundColor: theme.color.accentSoft, color: theme.color.accent, padding: '4px 10px', borderRadius: '20px', fontWeight: 600, fontFamily: theme.font.body },
  statusChip: { fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '20px' },
  description: { fontSize: '14px', color: theme.color.inkSoft, margin: '0 0 20px 0', fontFamily: theme.font.body, lineHeight: 1.6 },
  deleteBtn: { padding: '8px 14px', backgroundColor: theme.color.dangerSoft, color: theme.color.danger, border: 'none', borderRadius: theme.radius.sm, cursor: 'pointer', fontSize: '13px', fontWeight: 500, fontFamily: theme.font.body, flexShrink: 0 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 280px', gap: '16px', alignItems: 'start' },
  mainCol: { display: 'flex', flexDirection: 'column', gap: '16px' },
  sideCol: { display: 'flex', flexDirection: 'column', gap: '16px' },
  card: { backgroundColor: theme.color.surface, borderRadius: theme.radius.md, border: `1px solid ${theme.color.border}`, padding: '20px' },
  cardTitle: { fontSize: '14px', fontWeight: 600, color: theme.color.ink, margin: '0 0 14px 0', fontFamily: theme.font.body },
  statusRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  statusBtn: { padding: '8px 16px', backgroundColor: theme.color.bg, border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.sm, cursor: 'pointer', fontSize: '13px', color: theme.color.inkSoft, fontFamily: theme.font.body, fontWeight: 500 },
  statusBtnActive: { padding: '8px 16px', backgroundColor: theme.color.accentSoft, border: `1px solid ${theme.color.accent}`, borderRadius: theme.radius.sm, cursor: 'pointer', fontSize: '13px', color: theme.color.accent, fontFamily: theme.font.body, fontWeight: 600 },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  field: { marginBottom: '14px' },
  label: { display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500, color: theme.color.ink, fontFamily: theme.font.body },
  input: { width: '100%', padding: '9px 12px', border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.sm, fontSize: '13.5px', boxSizing: 'border-box', fontFamily: theme.font.body, outline: 'none' },
  saveBtn: { padding: '9px 18px', backgroundColor: theme.color.accent, color: '#fff', border: 'none', borderRadius: theme.radius.sm, cursor: 'pointer', fontSize: '13.5px', fontWeight: 500, fontFamily: theme.font.body },
  detailRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', marginBottom: '12px', borderBottom: `1px solid ${theme.color.border}` },
  detailLabel: { fontSize: '12.5px', color: theme.color.inkSoft, fontFamily: theme.font.body, fontWeight: 500 },
  detailValue: { fontSize: '13.5px', color: theme.color.ink, fontFamily: theme.font.body },
  readOnly: { fontSize: '10.5px', color: theme.color.inkFaint, fontFamily: theme.font.body, backgroundColor: theme.color.bg, padding: '2px 7px', borderRadius: '20px' },
  alertError: { backgroundColor: theme.color.dangerSoft, color: theme.color.danger, padding: '10px 14px', borderRadius: theme.radius.sm, marginBottom: '16px', fontSize: '13.5px', fontFamily: theme.font.body },
  alertSuccess: { backgroundColor: theme.color.successSoft, color: theme.color.success, padding: '10px 14px', borderRadius: theme.radius.sm, marginBottom: '16px', fontSize: '13.5px', fontFamily: theme.font.body },
  loading: { textAlign: 'center', padding: '40px', color: theme.color.inkSoft, fontFamily: theme.font.body },
  statusNotice: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: theme.color.warning, backgroundColor: theme.color.warningSoft, padding: '10px 14px', borderRadius: theme.radius.sm, marginBottom: '14px', fontFamily: theme.font.body, border: `1px solid ${theme.color.border}` },
};

export default TaskDetailPage;