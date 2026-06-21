import { useEffect, useState } from 'react';
import { getTasks, updateTaskStatus } from '../../api/tasksApi';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const KanbanBoardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data } = await getTasks();
        setTasks(data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const todo = tasks.filter((t) => t.status === 'To Do');
  const inProgress = tasks.filter((t) => t.status === 'In Progress');
  const completed = tasks.filter((t) => t.status === 'Completed');

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      setTasks(tasks.map((t) =>
        t.task_id === taskId ? { ...t, status: newStatus } : t
      ));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getPriorityColor = (priority) => {
    if (priority === 'High') return '#dc2626';
    if (priority === 'Medium') return '#d97706';
    return '#16a34a';
  };

  const TaskCard = ({ task }) => (
    <div style={styles.card} onClick={() => navigate(`/tasks/${task.task_id}`)}>
      <p style={styles.cardTitle}>{task.title}</p>
      <p style={{ ...styles.cardPriority, color: getPriorityColor(task.priority) }}>
        {task.priority}
      </p>
      {task.due_date && (
        <p style={styles.cardDue}>
          Due: {new Date(task.due_date).toLocaleDateString()}
        </p>
      )}
      <div style={styles.cardActions} onClick={(e) => e.stopPropagation()}>
        {task.status !== 'To Do' && (
          <button
            style={styles.moveBtn}
            onClick={() => handleStatusChange(task.task_id, 'To Do')}
          >
            ← To Do
          </button>
        )}
        {task.status !== 'In Progress' && (
          <button
            style={styles.moveBtn}
            onClick={() => handleStatusChange(task.task_id, 'In Progress')}
          >
            In Progress
          </button>
        )}
        {task.status !== 'Completed' && (
          <button
            style={styles.moveBtn}
            onClick={() => handleStatusChange(task.task_id, 'Completed')}
          >
            Done →
          </button>
        )}
      </div>
    </div>
  );

  if (loading) return <div style={styles.loading}>Loading board...</div>;

  return (
    <div style={styles.content}>
      <div style={styles.header}>
        <h2 style={styles.pageTitle}>Kanban Board</h2>
        <button
          style={styles.listBtn}
          onClick={() => navigate('/tasks')}
        >
          List View
        </button>
      </div>

      <div style={styles.board}>
        <div style={styles.column}>
          <div style={{ ...styles.columnHeader, borderTop: '3px solid #6b7280' }}>
            <span>To Do</span>
            <span style={styles.badge}>{todo.length}</span>
          </div>
          {todo.map((t) => <TaskCard key={t.task_id} task={t} />)}
        </div>

        <div style={styles.column}>
          <div style={{ ...styles.columnHeader, borderTop: '3px solid #4f46e5' }}>
            <span>In Progress</span>
            <span style={styles.badge}>{inProgress.length}</span>
          </div>
          {inProgress.map((t) => <TaskCard key={t.task_id} task={t} />)}
        </div>

        <div style={styles.column}>
          <div style={{ ...styles.columnHeader, borderTop: '3px solid #16a34a' }}>
            <span>Completed</span>
            <span style={styles.badge}>{completed.length}</span>
          </div>
          {completed.map((t) => <TaskCard key={t.task_id} task={t} />)}
        </div>
      </div>
    </div>
  );
};

const styles = {
  content: { padding: '24px', backgroundColor: '#f0f2f5', minHeight: '100%' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  pageTitle: { fontSize: '22px', color: '#1a1a2e', margin: 0 },
  listBtn: { padding: '8px 16px', backgroundColor: '#fff', color: '#4f46e5', border: '1px solid #4f46e5', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' },
  board: { display: 'flex', gap: '16px', alignItems: 'flex-start' },
  column: { flex: 1, backgroundColor: '#fff', borderRadius: '8px', padding: '16px', minHeight: '400px' },
  columnHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0 16px 0', fontWeight: '600', fontSize: '15px', color: '#1a1a2e' },
  badge: { backgroundColor: '#f0f2f5', color: '#555', padding: '2px 8px', borderRadius: '12px', fontSize: '13px' },
  card: { backgroundColor: '#f8f9fa', borderRadius: '6px', padding: '12px', marginBottom: '10px', cursor: 'pointer', border: '1px solid #e5e7eb' },
  cardTitle: { fontSize: '14px', fontWeight: '600', color: '#1a1a2e', margin: '0 0 6px 0' },
  cardPriority: { fontSize: '12px', fontWeight: '500', margin: '0 0 4px 0' },
  cardDue: { fontSize: '12px', color: '#6b7280', margin: '0 0 8px 0' },
  cardActions: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  moveBtn: { padding: '3px 8px', backgroundColor: '#ede9fe', color: '#4f46e5', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' },
  loading: { textAlign: 'center', padding: '40px', color: '#666' },
};

export default KanbanBoardPage;