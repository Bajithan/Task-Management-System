import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectById } from '../../api/projectsApi';
import { getTasks, createTask, updateTaskStatus } from '../../api/tasksApi';
import usersApi from '../../api/usersApi';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { theme, statusColor, priorityColor } from '../../styles/theme';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [assignableUsers, setAssignableUsers] = useState([]);
  const [view, setView] = useState('list');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth <= 768;

  const canUpdateStatus = (task) => {
    return user?.role === 'Admin' || !task.assigned_to || task.assigned_to === user?.user_id;
  };

  const [form, setForm] = useState({ title: '', description: '', priority: 'Medium', due_date: '', assigned_to: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projectRes, tasksRes, usersRes] = await Promise.all([
        getProjectById(id), getTasks({ project_id: id }), usersApi.getAssignableUsers(),
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);
      setAssignableUsers(usersRes.data);
    } catch (err) {
      setError('Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createTask({ ...form, project_id: id, assigned_to: form.assigned_to || null, due_date: form.due_date || null });
      setShowModal(false);
      setForm({ title: '', description: '', priority: 'Medium', due_date: '', assigned_to: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      setTasks(tasks.map((t) => (t.task_id === taskId ? { ...t, status: newStatus } : t)));
    } catch (err) { console.error(err); }
  };

  const getAssigneeName = (userId) => {
    const u = assignableUsers.find((u) => u.user_id === userId);
    return u ? `${u.first_name} ${u.last_name}` : '—';
  };

  if (loading) return <LoadingSpinner />;
  if (!project) return <div style={s.alertError}>Project not found</div>;

  const todo = tasks.filter((t) => t.status === 'To Do');
  const inProgress = tasks.filter((t) => t.status === 'In Progress');
  const completed = tasks.filter((t) => t.status === 'Completed');

  return (
    <div style={s.page}>
      <button style={s.backBtn} onClick={() => navigate('/projects')}>← Back to projects</button>

      <div style={s.projectHeader}>
        <div>
          <h1 style={s.title}>{project.name}</h1>
          <p style={s.subtitle}>{project.description || 'No description'}</p>
        </div>
        <span style={{ ...s.statusPill, color: statusColor(project.status), backgroundColor: `${statusColor(project.status)}14` }}>
          {project.status}
        </span>
      </div>

      <div style={s.toolbar}>
        <div style={s.viewToggle}>
          <div style={view === 'list' ? s.toggleActive : s.toggle} onClick={() => setView('list')}>List</div>
          <div style={view === 'kanban' ? s.toggleActive : s.toggle} onClick={() => setView('kanban')}>Kanban</div>
        </div>
        <button style={s.primaryBtn} onClick={() => setShowModal(true)}>+ Create task</button>
      </div>

      {error && <div style={s.alertError}>{error}</div>}

      {view === 'list' ? (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Title</th><th style={s.th}>Priority</th><th style={s.th}>Status</th>
                <th style={s.th}>Assigned to</th><th style={s.th}>Due date</th><th style={s.th}></th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.task_id} style={s.tr}>
                  <td style={s.td}>{task.title}</td>
                  <td style={s.td}><PriorityTag value={task.priority} /></td>
                  <td style={s.td}><StatusTag value={task.status} /></td>
                  <td style={s.td}>{getAssigneeName(task.assigned_to)}</td>
                  <td style={s.td}>{task.due_date ? new Date(task.due_date).toLocaleDateString() : '—'}</td>
                  <td style={s.td}><button style={s.viewBtn} onClick={() => navigate(`/tasks/${task.task_id}`)}>View</button></td>
                </tr>
              ))}
              {tasks.length === 0 && <tr><td colSpan={6} style={s.empty}>No tasks in this project yet</td></tr>}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ ...s.board, flexDirection: isMobile ? 'column' : 'row' }}>
          {[{ label: 'To Do', items: todo, color: theme.color.inkSoft }, { label: 'In Progress', items: inProgress, color: theme.color.accent }, { label: 'Completed', items: completed, color: theme.color.success }].map((col) => (
            <div key={col.label} style={{ ...s.column, minWidth: isMobile ? 'auto' : '280px', width: isMobile ? '100%' : 'auto' }}>
              <div style={{ ...s.columnHeader, borderTop: `2px solid ${col.color}` }}>
                <span>{col.label}</span><span style={s.badge}>{col.items.length}</span>
              </div>
              {col.items.map((task) => {
                const showActions = canUpdateStatus(task);
                return (
                  <div key={task.task_id} style={s.taskCard} onClick={() => navigate(`/tasks/${task.task_id}`)}>
                    <p style={s.cardTitle}>{task.title}</p>
                    <PriorityTag value={task.priority} />
                    <p style={s.cardAssignee}>{getAssigneeName(task.assigned_to)}</p>
                    {showActions && (
                      <div style={s.cardActions} onClick={(e) => e.stopPropagation()}>
                        {task.status !== 'To Do' && <button style={s.moveBtn} onClick={() => handleStatusChange(task.task_id, 'To Do')}>← To Do</button>}
                        {task.status !== 'In Progress' && <button style={s.moveBtn} onClick={() => handleStatusChange(task.task_id, 'In Progress')}>In Progress</button>}
                        {task.status !== 'Completed' && <button style={s.moveBtn} onClick={() => handleStatusChange(task.task_id, 'Completed')}>Done →</button>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h2 style={s.modalTitle}>Create task in {project.name}</h2>
            {error && <div style={s.alertError}>{error}</div>}
            <form onSubmit={handleCreateTask}>
              <Field label="Title"><input style={s.input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></Field>
              <Field label="Description"><textarea style={{ ...s.input, minHeight: '70px' }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
              <Field label="Priority">
                <select style={s.input} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option>
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
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                />
              </Field>
              <Field label="Assign to">
                <select style={s.input} value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}>
                  <option value="">Unassigned</option>
                  {assignableUsers.map((u) => <option key={u.user_id} value={u.user_id}>{u.first_name} {u.last_name} ({u.role})</option>)}
                </select>
              </Field>
              <div style={s.modalActions}>
                <button type="button" style={s.secondaryBtn} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" style={s.primaryBtn}>Create task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const PriorityTag = ({ value }) => (
  <span style={{ fontSize: '12.5px', fontWeight: 500, color: priorityColor(value), display: 'inline-flex', alignItems: 'center', gap: '5px', margin: '4px 0' }}>
    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: priorityColor(value) }} />{value}
  </span>
);
const StatusTag = ({ value }) => <span style={{ fontSize: '13px', fontWeight: 500, color: statusColor(value) }}>{value}</span>;
const Field = ({ label, children }) => <div style={s.field}><label style={s.label}>{label}</label>{children}</div>;

const s = {
  page: { padding: '28px 28px', width: '100%', boxSizing: 'border-box' },
  backBtn: { background: 'none', border: 'none', color: theme.color.accent, cursor: 'pointer', fontSize: '13.5px', padding: 0, marginBottom: '16px', fontFamily: theme.font.body, fontWeight: 500 },
  projectHeader: { backgroundColor: theme.color.surface, borderRadius: theme.radius.md, border: `1px solid ${theme.color.border}`, padding: '20px 22px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' },
  title: { fontSize: '19px', fontWeight: 700, color: theme.color.ink, margin: '0 0 6px 0', fontFamily: theme.font.body, letterSpacing: '-0.01em' },
  subtitle: { fontSize: '13.5px', color: theme.color.inkSoft, margin: 0, fontFamily: theme.font.body },
  statusPill: { fontSize: '12px', fontWeight: 600, padding: '4px 12px', borderRadius: '20px', flexShrink: 0 },
  toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' },
  viewToggle: { display: 'flex', backgroundColor: theme.color.surface, borderRadius: theme.radius.sm, overflow: 'hidden', border: `1px solid ${theme.color.border}` },
  toggle: { padding: '7px 16px', cursor: 'pointer', fontSize: '13px', color: theme.color.inkSoft, fontFamily: theme.font.body, fontWeight: 500 },
  toggleActive: { padding: '7px 16px', cursor: 'pointer', fontSize: '13px', color: '#fff', backgroundColor: theme.color.accent, fontFamily: theme.font.body, fontWeight: 500 },
  primaryBtn: { padding: '9px 16px', backgroundColor: theme.color.accent, color: '#fff', border: 'none', borderRadius: theme.radius.sm, cursor: 'pointer', fontSize: '13.5px', fontWeight: 500, fontFamily: theme.font.body },
  secondaryBtn: { padding: '9px 16px', backgroundColor: theme.color.surface, color: theme.color.inkSoft, border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.sm, cursor: 'pointer', fontSize: '13.5px', fontWeight: 500, fontFamily: theme.font.body },
  tableWrap: { backgroundColor: theme.color.surface, borderRadius: theme.radius.md, border: `1px solid ${theme.color.border}`, overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '11px 16px', textAlign: 'left', backgroundColor: '#FAFAFB', fontSize: '11.5px', color: theme.color.inkSoft, fontWeight: 600, fontFamily: theme.font.body, borderBottom: `1px solid ${theme.color.border}` },
  tr: { borderBottom: `1px solid ${theme.color.border}` },
  td: { padding: '12px 16px', fontSize: '13.5px', color: theme.color.ink, fontFamily: theme.font.body },
  viewBtn: { padding: '5px 11px', backgroundColor: theme.color.accentSoft, color: theme.color.accent, border: 'none', borderRadius: theme.radius.sm, cursor: 'pointer', fontSize: '12.5px', fontWeight: 500, fontFamily: theme.font.body },
  empty: { padding: '24px', textAlign: 'center', color: theme.color.inkFaint, fontFamily: theme.font.body },
  alertError: { backgroundColor: theme.color.dangerSoft, color: theme.color.danger, padding: '10px 14px', borderRadius: theme.radius.sm, marginBottom: '16px', fontSize: '13.5px', fontFamily: theme.font.body },
  board: { display: 'flex', gap: '14px', alignItems: 'flex-start' },
  column: { flex: 1, backgroundColor: theme.color.surface, borderRadius: theme.radius.md, padding: '14px', minHeight: '300px', border: `1px solid ${theme.color.border}` },
  columnHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0 14px 0', fontWeight: 600, fontSize: '14px', color: theme.color.ink, fontFamily: theme.font.body },
  badge: { backgroundColor: theme.color.bg, color: theme.color.inkSoft, padding: '2px 8px', borderRadius: '20px', fontSize: '12px', fontFamily: theme.font.body },
  taskCard: { backgroundColor: theme.color.bg, borderRadius: theme.radius.sm, padding: '12px', marginBottom: '8px', cursor: 'pointer', border: `1px solid ${theme.color.border}` },
  cardTitle: { fontSize: '13.5px', fontWeight: 600, color: theme.color.ink, margin: '0 0 2px 0', fontFamily: theme.font.body },
  cardAssignee: { fontSize: '12px', color: theme.color.inkSoft, margin: '2px 0 8px 0', fontFamily: theme.font.body },
  cardActions: { display: 'flex', gap: '5px', flexWrap: 'wrap' },
  moveBtn: { padding: '3px 8px', backgroundColor: theme.color.accentSoft, color: theme.color.accent, border: 'none', borderRadius: theme.radius.sm, cursor: 'pointer', fontSize: '10.5px', fontFamily: theme.font.body, fontWeight: 500 },
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { backgroundColor: theme.color.surface, padding: '28px', borderRadius: theme.radius.lg, width: '100%', maxWidth: '440px', maxHeight: '90vh', overflowY: 'auto' },
  modalTitle: { fontSize: '17px', fontWeight: 700, color: theme.color.ink, marginBottom: '18px', fontFamily: theme.font.body },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px' },
  field: { marginBottom: '14px' },
  label: { display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500, color: theme.color.ink, fontFamily: theme.font.body },
  input: { width: '100%', padding: '9px 12px', border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.sm, fontSize: '13.5px', boxSizing: 'border-box', fontFamily: theme.font.body, outline: 'none' },
};

export default ProjectDetailPage;