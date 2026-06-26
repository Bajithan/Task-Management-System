import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTasks, updateTaskStatus } from '../../api/tasksApi';
import usersApi from '../../api/usersApi';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useAuth } from '../../context/AuthContext';
import { theme, statusColor, priorityColor } from '../../styles/theme';

const TasksPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [view, setView] = useState('list');
  const [tasks, setTasks] = useState([]);
  const [assignableUsers, setAssignableUsers] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const canUpdateStatus = (task) => {
    return user?.role === 'Admin' || !task.assigned_to || task.assigned_to === user?.user_id;
  };
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth <= 768;

  useEffect(() => { fetchUsers(); }, []);
  useEffect(() => { fetchTasks(); }, [statusFilter, priorityFilter]);

  const { socket } = useWebSocket();

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      fetchTasks();
    };

    socket.on('task-assigned', handleUpdate);
    socket.on('status-changed', handleUpdate);
    socket.on('task-updated', handleUpdate);

    return () => {
      socket.off('task-assigned', handleUpdate);
      socket.off('status-changed', handleUpdate);
      socket.off('task-updated', handleUpdate);
    };
  }, [socket]);

  const fetchUsers = async () => {
    try { const res = await usersApi.getAssignableUsers(); setAssignableUsers(res.data); }
    catch (err) { console.error(err); }
  };

  const fetchTasks = async () => {
    if (tasks.length === 0) {
      setLoading(true);
    }
    try { const { data } = await getTasks({ status: statusFilter, priority: priorityFilter }); setTasks(data); }
    catch (err) { setError('Failed to load tasks'); }
    finally { setLoading(false); }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      setTasks(tasks.map((t) => (t.task_id === taskId ? { ...t, status: newStatus } : t)));
    } catch (err) { console.error(err); }
  };

  const getAssigneeName = (userId) => {
    if (!userId) return 'Unassigned';
    const u = assignableUsers.find((u) => u.user_id === userId);
    return u ? `${u.first_name} ${u.last_name}` : 'Unassigned';
  };

  const todo = tasks.filter((t) => t.status === 'To Do');
  const inProgress = tasks.filter((t) => t.status === 'In Progress');
  const completed = tasks.filter((t) => t.status === 'Completed');

  const TaskCard = ({ task }) => {
    const showActions = canUpdateStatus(task);
    return (
      <div style={s.taskCard} onClick={() => navigate(`/tasks/${task.task_id}`)}>
        <p style={s.cardTitle}>{task.title}</p>
        <PriorityTag value={task.priority} />
        <p style={s.cardAssignee}>{getAssigneeName(task.assigned_to)}</p>
        {task.due_date && <p style={s.cardDue}>Due {new Date(task.due_date).toLocaleDateString()}</p>}
        {showActions && (
          <div style={s.cardActions} onClick={(e) => e.stopPropagation()}>
            {task.status !== 'To Do' && <button style={s.moveBtn} onClick={() => handleStatusChange(task.task_id, 'To Do')}>← To Do</button>}
            {task.status !== 'In Progress' && <button style={s.moveBtn} onClick={() => handleStatusChange(task.task_id, 'In Progress')}>In Progress</button>}
            {task.status !== 'Completed' && <button style={s.moveBtn} onClick={() => handleStatusChange(task.task_id, 'Completed')}>Done →</button>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>All tasks</h1>
          <p style={s.subtitle}>Every task across every project.</p>
        </div>
        <div style={s.viewToggle}>
          <div style={view === 'list' ? s.toggleActive : s.toggle} onClick={() => setView('list')}>List</div>
          <div style={view === 'kanban' ? s.toggleActive : s.toggle} onClick={() => setView('kanban')}>Kanban</div>
        </div>
      </div>

      {error && <div style={s.alertError}>{error}</div>}

      {view === 'list' && (
        <div style={s.toolbar}>
          <select style={s.select} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option><option value="To Do">To Do</option><option value="In Progress">In Progress</option><option value="Completed">Completed</option>
          </select>
          <select style={s.select} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="">All priorities</option><option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option>
          </select>
        </div>
      )}

      {loading ? (
        <div style={s.loading}>Loading tasks...</div>
      ) : view === 'list' ? (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr><th style={s.th}>Title</th><th style={s.th}>Priority</th><th style={s.th}>Status</th><th style={s.th}>Assigned to</th><th style={s.th}>Due date</th><th style={s.th}></th></tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.task_id} style={s.tr}>
                  <td style={s.td}>{task.title}</td>
                  <td style={s.td}><PriorityTag value={task.priority} /></td>
                  <td style={s.td}><span style={{ color: statusColor(task.status), fontWeight: 500, fontSize: '13px' }}>{task.status}</span></td>
                  <td style={s.td}>{getAssigneeName(task.assigned_to)}</td>
                  <td style={s.td}>{task.due_date ? new Date(task.due_date).toLocaleDateString() : '—'}</td>
                  <td style={s.td}><button style={s.viewBtn} onClick={() => navigate(`/tasks/${task.task_id}`)}>View</button></td>
                </tr>
              ))}
              {tasks.length === 0 && <tr><td colSpan={6} style={s.empty}>No tasks found</td></tr>}
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
              {col.items.map((t) => <TaskCard key={t.task_id} task={t} />)}
            </div>
          ))}
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

const s = {
  page: { padding: '28px 28px', width: '100%', boxSizing: 'border-box' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
  title: { fontSize: '22px', fontWeight: 700, color: theme.color.ink, margin: '0 0 4px 0', fontFamily: theme.font.body, letterSpacing: '-0.01em' },
  subtitle: { fontSize: '13.5px', color: theme.color.inkSoft, margin: 0, fontFamily: theme.font.body },
  viewToggle: { display: 'flex', backgroundColor: theme.color.surface, borderRadius: theme.radius.sm, overflow: 'hidden', border: `1px solid ${theme.color.border}` },
  toggle: { padding: '7px 16px', cursor: 'pointer', fontSize: '13px', color: theme.color.inkSoft, fontFamily: theme.font.body, fontWeight: 500 },
  toggleActive: { padding: '7px 16px', cursor: 'pointer', fontSize: '13px', color: '#fff', backgroundColor: theme.color.accent, fontFamily: theme.font.body, fontWeight: 500 },
  toolbar: { display: 'flex', gap: '10px', marginBottom: '18px' },
  select: { padding: '9px 12px', border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.sm, fontSize: '13.5px', fontFamily: theme.font.body, color: theme.color.ink },
  tableWrap: { backgroundColor: theme.color.surface, borderRadius: theme.radius.md, border: `1px solid ${theme.color.border}`, overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '11px 16px', textAlign: 'left', backgroundColor: '#FAFAFB', fontSize: '11.5px', color: theme.color.inkSoft, fontWeight: 600, fontFamily: theme.font.body, borderBottom: `1px solid ${theme.color.border}` },
  tr: { borderBottom: `1px solid ${theme.color.border}` },
  td: { padding: '12px 16px', fontSize: '13.5px', color: theme.color.ink, fontFamily: theme.font.body },
  empty: { padding: '24px', textAlign: 'center', color: theme.color.inkFaint, fontFamily: theme.font.body },
  viewBtn: { padding: '5px 11px', backgroundColor: theme.color.accentSoft, color: theme.color.accent, border: 'none', borderRadius: theme.radius.sm, cursor: 'pointer', fontSize: '12.5px', fontWeight: 500, fontFamily: theme.font.body },
  alertError: { backgroundColor: theme.color.dangerSoft, color: theme.color.danger, padding: '10px 14px', borderRadius: theme.radius.sm, marginBottom: '16px', fontSize: '13.5px', fontFamily: theme.font.body },
  loading: { textAlign: 'center', padding: '40px', color: theme.color.inkSoft, fontFamily: theme.font.body },
  board: { display: 'flex', gap: '14px', alignItems: 'flex-start' },
  column: { flex: 1, backgroundColor: theme.color.surface, borderRadius: theme.radius.md, padding: '14px', minHeight: '400px', border: `1px solid ${theme.color.border}` },
  columnHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0 14px 0', fontWeight: 600, fontSize: '14px', color: theme.color.ink, fontFamily: theme.font.body },
  badge: { backgroundColor: theme.color.bg, color: theme.color.inkSoft, padding: '2px 8px', borderRadius: '20px', fontSize: '12px', fontFamily: theme.font.body },
  taskCard: { backgroundColor: theme.color.bg, borderRadius: theme.radius.sm, padding: '12px', marginBottom: '8px', cursor: 'pointer', border: `1px solid ${theme.color.border}` },
  cardTitle: { fontSize: '13.5px', fontWeight: 600, color: theme.color.ink, margin: '0 0 2px 0', fontFamily: theme.font.body },
  cardAssignee: { fontSize: '12px', color: theme.color.inkSoft, margin: '2px 0 4px 0', fontFamily: theme.font.body },
  cardDue: { fontSize: '11.5px', color: theme.color.inkFaint, margin: '0 0 8px 0', fontFamily: theme.font.body },
  cardActions: { display: 'flex', gap: '5px', flexWrap: 'wrap' },
  moveBtn: { padding: '3px 8px', backgroundColor: theme.color.accentSoft, color: theme.color.accent, border: 'none', borderRadius: theme.radius.sm, cursor: 'pointer', fontSize: '10.5px', fontFamily: theme.font.body, fontWeight: 500 },
};

export default TasksPage;