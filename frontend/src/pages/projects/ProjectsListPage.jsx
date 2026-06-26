import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllProjects, createProject } from '../../api/projectsApi';
import { getTasks, createTask } from '../../api/tasksApi';
import usersApi from '../../api/usersApi';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { theme, statusColor, priorityColor } from '../../styles/theme';

const ProjectsListPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [otherTasks, setOtherTasks] = useState([]);
  const [assignableUsers, setAssignableUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [error, setError] = useState('');

  const [projectForm, setProjectForm] = useState({ name: '', description: '', status: 'Planning' });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'Medium', due_date: '', assigned_to: '' });

  const fetchProjects = async () => {
    if (projects.length === 0) {
      setLoading(true);
    }
    try {
      const res = await getAllProjects();
      setProjects(res.data);
    } catch (err) {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchOtherTasks = async () => {
    if (otherTasks.length === 0) {
      setLoading(true);
    }
    try {
      const [tasksRes, usersRes] = await Promise.all([
        getTasks({ no_project: true }),
        usersApi.getAssignableUsers(),
      ]);
      setOtherTasks(tasksRes.data);
      setAssignableUsers(usersRes.data);
    } catch (err) {
      setError('Failed to load other tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'projects') fetchProjects();
    else fetchOtherTasks();
  }, [activeTab]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createProject(projectForm);
      setShowProjectModal(false);
      setProjectForm({ name: '', description: '', status: 'Planning' });
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create project');
    }
  };

  const handleCreateOtherTask = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createTask({ ...taskForm, project_id: null, assigned_to: taskForm.assigned_to || null, due_date: taskForm.due_date || null });
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', priority: 'Medium', due_date: '', assigned_to: '' });
      fetchOtherTasks();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create task');
    }
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Projects</h1>
          <p style={s.subtitle}>Manage projects and standalone tasks.</p>
        </div>
        {activeTab === 'projects' ? (
          <button style={s.primaryBtn} onClick={() => setShowProjectModal(true)}>+ Create project</button>
        ) : (
          <button style={s.primaryBtn} onClick={() => setShowTaskModal(true)}>+ Create task</button>
        )}
      </div>

      <div style={s.tabs}>
        <div style={activeTab === 'projects' ? s.tabActive : s.tab} onClick={() => setActiveTab('projects')}>Projects</div>
        <div style={activeTab === 'other' ? s.tabActive : s.tab} onClick={() => setActiveTab('other')}>Other tasks</div>
      </div>

      {error && <div style={s.alertError}>{error}</div>}

      {loading ? (
        <LoadingSpinner />
      ) : activeTab === 'projects' ? (
        <div style={s.grid}>
          {projects.map((project) => (
            <div key={project.project_id} style={s.card} onClick={() => navigate(`/projects/${project.project_id}`)}>
              <h3 style={s.cardTitle}>{project.name}</h3>
              <p style={s.cardDesc}>{project.description || 'No description'}</p>
              <span style={{ ...s.statusPill, color: statusColor(project.status), backgroundColor: `${statusColor(project.status)}14` }}>
                {project.status}
              </span>
            </div>
          ))}
          {projects.length === 0 && <div style={s.emptyBlock}>No projects yet. Create your first project.</div>}
        </div>
      ) : (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Title</th>
                <th style={s.th}>Priority</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Assigned to</th>
                <th style={s.th}>Due date</th>
                <th style={s.th}></th>
              </tr>
            </thead>
            <tbody>
              {otherTasks.map((task) => {
                const assignee = assignableUsers.find((u) => u.user_id === task.assigned_to);
                return (
                  <tr key={task.task_id} style={s.tr}>
                    <td style={s.td}>{task.title}</td>
                    <td style={s.td}><PriorityTag value={task.priority} /></td>
                    <td style={s.td}><StatusTag value={task.status} /></td>
                    <td style={s.td}>{assignee ? `${assignee.first_name} ${assignee.last_name}` : '—'}</td>
                    <td style={s.td}>{task.due_date ? new Date(task.due_date).toLocaleDateString() : '—'}</td>
                    <td style={s.td}><button style={s.viewBtn} onClick={() => navigate(`/tasks/${task.task_id}`)}>View</button></td>
                  </tr>
                );
              })}
              {otherTasks.length === 0 && <tr><td colSpan={6} style={s.empty}>No standalone tasks. Create one above.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showProjectModal && (
        <Modal title="Create new project" onClose={() => setShowProjectModal(false)}>
          {error && <div style={s.alertError}>{error}</div>}
          <form onSubmit={handleCreateProject}>
            <Field label="Project name">
              <input style={s.input} value={projectForm.name} onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })} required />
            </Field>
            <Field label="Description">
              <textarea style={{ ...s.input, minHeight: '80px' }} value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} />
            </Field>
            <Field label="Status">
              <select style={s.input} value={projectForm.status} onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}>
                <option value="Planning">Planning</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </Field>
            <div style={s.modalActions}>
              <button type="button" style={s.secondaryBtn} onClick={() => setShowProjectModal(false)}>Cancel</button>
              <button type="submit" style={s.primaryBtn}>Create project</button>
            </div>
          </form>
        </Modal>
      )}

      {showTaskModal && (
        <Modal title="Create standalone task" subtitle="This task will not belong to any project." onClose={() => setShowTaskModal(false)}>
          {error && <div style={s.alertError}>{error}</div>}
          <form onSubmit={handleCreateOtherTask}>
            <Field label="Title">
              <input style={s.input} value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} required />
            </Field>
            <Field label="Description">
              <textarea style={{ ...s.input, minHeight: '70px' }} value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} />
            </Field>
            <Field label="Priority">
              <select style={s.input} value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
                <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option>
              </select>
            </Field>
            <Field label="Due date">
              <input type="date" style={s.input} value={taskForm.due_date} onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })} />
            </Field>
            <Field label="Assign to">
              <select style={s.input} value={taskForm.assigned_to} onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}>
                <option value="">Unassigned</option>
                {assignableUsers.map((u) => <option key={u.user_id} value={u.user_id}>{u.first_name} {u.last_name} ({u.role})</option>)}
              </select>
            </Field>
            <div style={s.modalActions}>
              <button type="button" style={s.secondaryBtn} onClick={() => setShowTaskModal(false)}>Cancel</button>
              <button type="submit" style={s.primaryBtn}>Create task</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

const PriorityTag = ({ value }) => (
  <span style={{ fontSize: '13px', fontWeight: 500, color: priorityColor(value), display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: priorityColor(value) }} />{value}
  </span>
);
const StatusTag = ({ value }) => <span style={{ fontSize: '13px', fontWeight: 500, color: statusColor(value) }}>{value}</span>;

const Field = ({ label, children }) => (
  <div style={s.field}><label style={s.label}>{label}</label>{children}</div>
);

const Modal = ({ title, subtitle, onClose, children }) => (
  <div style={s.overlay}>
    <div style={s.modal}>
      <h2 style={s.modalTitle}>{title}</h2>
      {subtitle && <p style={s.modalSubtitle}>{subtitle}</p>}
      {children}
    </div>
  </div>
);

const s = {
  page: { padding: '28px 28px', width: '100%', boxSizing: 'border-box' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' },
  title: { fontFamily: theme.font.body, fontSize: '22px', fontWeight: 700, color: theme.color.ink, margin: '0 0 4px 0', letterSpacing: '-0.01em' },
  subtitle: { fontSize: '13.5px', color: theme.color.inkSoft, margin: 0, fontFamily: theme.font.body },
  primaryBtn: { padding: '9px 16px', backgroundColor: theme.color.accent, color: '#fff', border: 'none', borderRadius: theme.radius.sm, cursor: 'pointer', fontSize: '13.5px', fontWeight: 500, fontFamily: theme.font.body, flexShrink: 0 },
  secondaryBtn: { padding: '9px 16px', backgroundColor: theme.color.surface, color: theme.color.inkSoft, border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.sm, cursor: 'pointer', fontSize: '13.5px', fontWeight: 500, fontFamily: theme.font.body },
  tabs: { display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: `1px solid ${theme.color.border}` },
  tab: { padding: '9px 16px', cursor: 'pointer', fontSize: '13.5px', color: theme.color.inkSoft, borderBottom: '2px solid transparent', fontFamily: theme.font.body, fontWeight: 500 },
  tabActive: { padding: '9px 16px', cursor: 'pointer', fontSize: '13.5px', color: theme.color.accent, fontWeight: 600, borderBottom: `2px solid ${theme.color.accent}`, fontFamily: theme.font.body },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' },
  card: { backgroundColor: theme.color.surface, borderRadius: theme.radius.md, padding: '18px', cursor: 'pointer', border: `1px solid ${theme.color.border}` },
  cardTitle: { fontSize: '15px', fontWeight: 600, color: theme.color.ink, margin: '0 0 6px 0', fontFamily: theme.font.body },
  cardDesc: { fontSize: '13px', color: theme.color.inkSoft, margin: '0 0 14px 0', fontFamily: theme.font.body, lineHeight: 1.5 },
  statusPill: { fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px' },
  tableWrap: { backgroundColor: theme.color.surface, borderRadius: theme.radius.md, border: `1px solid ${theme.color.border}`, overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '11px 16px', textAlign: 'left', backgroundColor: '#FAFAFB', fontSize: '11.5px', color: theme.color.inkSoft, fontWeight: 600, fontFamily: theme.font.body, borderBottom: `1px solid ${theme.color.border}` },
  tr: { borderBottom: `1px solid ${theme.color.border}` },
  td: { padding: '12px 16px', fontSize: '13.5px', color: theme.color.ink, fontFamily: theme.font.body },
  viewBtn: { padding: '5px 11px', backgroundColor: theme.color.accentSoft, color: theme.color.accent, border: 'none', borderRadius: theme.radius.sm, cursor: 'pointer', fontSize: '12.5px', fontWeight: 500, fontFamily: theme.font.body },
  empty: { padding: '24px', textAlign: 'center', color: theme.color.inkFaint, fontFamily: theme.font.body },
  emptyBlock: { padding: '32px', textAlign: 'center', color: theme.color.inkFaint, fontFamily: theme.font.body, gridColumn: '1 / -1', backgroundColor: theme.color.surface, borderRadius: theme.radius.md, border: `1px dashed ${theme.color.border}` },
  alertError: { backgroundColor: theme.color.dangerSoft, color: theme.color.danger, padding: '10px 14px', borderRadius: theme.radius.sm, marginBottom: '16px', fontSize: '13.5px', fontFamily: theme.font.body },
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { backgroundColor: theme.color.surface, padding: '28px', borderRadius: theme.radius.lg, width: '100%', maxWidth: '440px', maxHeight: '90vh', overflowY: 'auto' },
  modalTitle: { fontSize: '17px', fontWeight: 700, color: theme.color.ink, margin: '0 0 4px 0', fontFamily: theme.font.body },
  modalSubtitle: { fontSize: '13px', color: theme.color.inkSoft, margin: '0 0 16px 0', fontFamily: theme.font.body },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px' },
  field: { marginBottom: '14px' },
  label: { display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500, color: theme.color.ink, fontFamily: theme.font.body },
  input: { width: '100%', padding: '9px 12px', border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.sm, fontSize: '13.5px', boxSizing: 'border-box', fontFamily: theme.font.body, outline: 'none' },
};

export default ProjectsListPage;