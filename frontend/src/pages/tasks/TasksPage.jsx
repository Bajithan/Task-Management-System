import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTasks } from '../../api/tasksApi';
import { useAuth } from '../../context/AuthContext';

const TasksPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const canCreateTask = user?.role === 'Admin' || user?.role === 'Project Manager';

  useEffect(() => {
    fetchTasks();
  }, [statusFilter, priorityFilter]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data } = await getTasks({ status: statusFilter, priority: priorityFilter });
      setTasks(data);
    } catch (err) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    if (priority === 'High') return '#dc2626';
    if (priority === 'Medium') return '#d97706';
    return '#16a34a';
  };

  const getStatusColor = (status) => {
    if (status === 'Completed') return '#16a34a';
    if (status === 'In Progress') return '#4f46e5';
    return '#6b7280';
  };

  return (
    <div style={styles.content}>
      <div style={styles.header}>
        <h2 style={styles.pageTitle}>Task Management</h2>
        <div style={styles.headerActions}>
          <button
            style={styles.kanbanBtn}
            onClick={() => navigate('/tasks/kanban')}
          >
            Kanban View
          </button>
          {canCreateTask && (
            <button
              style={styles.button}
              onClick={() => navigate('/tasks/new')}
            >
              + Create Task
            </button>
          )}
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.toolbar}>
        <select
          style={styles.select}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        <select
          style={styles.select}
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      {loading ? (
        <div style={styles.loading}>Loading tasks...</div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Title</th>
              <th style={styles.th}>Priority</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Due Date</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.task_id} style={styles.tr}>
                <td style={styles.td}>{task.title}</td>
                <td style={styles.td}>
                  <span style={{ color: getPriorityColor(task.priority), fontWeight: '500' }}>
                    {task.priority}
                  </span>
                </td>
                <td style={styles.td}>
                  <span style={{ color: getStatusColor(task.status), fontWeight: '500' }}>
                    {task.status}
                  </span>
                </td>
                <td style={styles.td}>
                  {task.due_date ? new Date(task.due_date).toLocaleDateString() : '—'}
                </td>
                <td style={styles.td}>
                  <button
                    style={styles.viewBtn}
                    onClick={() => navigate(`/tasks/${task.task_id}`)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td colSpan={5} style={styles.empty}>No tasks found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

const styles = {
  content: { padding: '24px', backgroundColor: '#f0f2f5', minHeight: '100%' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  headerActions: { display: 'flex', gap: '12px' },
  pageTitle: { fontSize: '22px', color: '#1a1a2e', margin: 0 },
  toolbar: { display: 'flex', gap: '12px', marginBottom: '20px' },
  select: { padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' },
  button: { padding: '8px 16px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' },
  kanbanBtn: { padding: '8px 16px', backgroundColor: '#fff', color: '#4f46e5', border: '1px solid #4f46e5', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' },
  table: { width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '8px' },
  th: { padding: '12px 16px', textAlign: 'left', backgroundColor: '#f8f9fa', fontSize: '13px', color: '#555' },
  tr: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '12px 16px', fontSize: '14px', color: '#333' },
  empty: { padding: '24px', textAlign: 'center', color: '#999' },
  viewBtn: { padding: '4px 10px', backgroundColor: '#ede9fe', color: '#4f46e5', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' },
  error: { backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px 12px', borderRadius: '4px', marginBottom: '16px', fontSize: '14px' },
  loading: { textAlign: 'center', padding: '40px', color: '#666' },
};

export default TasksPage;