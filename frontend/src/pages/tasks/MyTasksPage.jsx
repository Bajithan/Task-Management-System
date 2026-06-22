import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTasks } from '../../api/tasksApi';
import { getProjectNames } from '../../api/projectsApi';
import { useAuth } from '../../context/AuthContext';
import { theme, statusColor, priorityColor } from '../../styles/theme';

const TABS = ['All', 'To Do', 'In Progress', 'Completed'];

const MyTasksPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState({});
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await getTasks({ assigned_to: user.user_id });
      setTasks(data);
      try {
        const projRes = await getProjectNames();
        const map = {};
        projRes.data.forEach((p) => { map[p.project_id] = p.name; });
        setProjects(map);
      } catch {
        setProjects({});
      }
    } catch (err) {
      setError('Failed to load your tasks');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    assigned: tasks.length,
    inProgress: tasks.filter((t) => t.status === 'In Progress').length,
    completed: tasks.filter((t) => t.status === 'Completed').length,
  };

  const filtered = activeTab === 'All' ? tasks : tasks.filter((t) => t.status === activeTab);

  return (
    <div style={s.page}>
      <h1 style={s.title}>My tasks</h1>
      <p style={s.subtitle}>Tasks assigned to you — update status and add comments.</p>

      <div style={s.statsRow}>
        <StatCard label="Assigned" value={stats.assigned} color={theme.color.accent} />
        <StatCard label="In progress" value={stats.inProgress} color={theme.color.warning} />
        <StatCard label="Completed" value={stats.completed} color={theme.color.success} />
      </div>

      <div style={s.tabs}>
        {TABS.map((tab) => (
          <div
            key={tab}
            style={activeTab === tab ? s.tabActive : s.tab}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </div>
        ))}
      </div>

      {error && <div style={s.alertError}>{error}</div>}

      {loading ? (
        <div style={s.loading}>Loading your tasks...</div>
      ) : (
        <div style={s.list}>
          {filtered.map((task) => (
            <div
              key={task.task_id}
              style={s.card}
              onClick={() => navigate(`/tasks/${task.task_id}`)}
            >
              <div style={s.cardTop}>
                <div style={s.cardLeft}>
                  <h3 style={s.cardTitle}>{task.title}</h3>
                  {task.description && <p style={s.cardDesc}>{task.description}</p>}
                </div>
                {task.project_id && projects[task.project_id] && (
                  <span style={s.projectTag}>{projects[task.project_id]}</span>
                )}
              </div>
              <div style={s.cardMeta}>
                <span style={{ ...s.metaItem, color: priorityColor(task.priority) }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: priorityColor(task.priority), display: 'inline-block', marginRight: '5px' }} />
                  {task.priority}
                </span>
                <span style={{ ...s.metaItem, color: statusColor(task.status) }}>
                  {task.status}
                </span>
                {task.due_date && (
                  <span style={s.metaDate}>
                    Due {new Date(task.due_date).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={s.empty}>No tasks in this category.</div>
          )}
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, color }) => (
  <div style={s.statCard}>
    <span style={s.statLabel}>{label}</span>
    <span style={{ ...s.statValue, color }}>{value}</span>
  </div>
);

const s = {
  page: { padding: '28px 28px', width: '100%', boxSizing: 'border-box' },
  title: { fontSize: '22px', fontWeight: 700, color: theme.color.ink, margin: '0 0 4px 0', fontFamily: theme.font.body, letterSpacing: '-0.01em' },
  subtitle: { fontSize: '13.5px', color: theme.color.inkSoft, margin: '0 0 22px 0', fontFamily: theme.font.body },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '22px' },
  statCard: { backgroundColor: theme.color.surface, borderRadius: theme.radius.md, border: `1px solid ${theme.color.border}`, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '6px' },
  statLabel: { fontSize: '11.5px', fontWeight: 600, color: theme.color.inkSoft, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: theme.font.body },
  statValue: { fontSize: '28px', fontWeight: 700, fontFamily: theme.font.body, lineHeight: 1 },
  tabs: { display: 'flex', gap: '4px', marginBottom: '18px', borderBottom: `1px solid ${theme.color.border}` },
  tab: { padding: '9px 16px', cursor: 'pointer', fontSize: '13.5px', color: theme.color.inkSoft, borderBottom: '2px solid transparent', fontFamily: theme.font.body, fontWeight: 500 },
  tabActive: { padding: '9px 16px', cursor: 'pointer', fontSize: '13.5px', color: theme.color.accent, fontWeight: 600, borderBottom: `2px solid ${theme.color.accent}`, fontFamily: theme.font.body },
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  card: { backgroundColor: theme.color.surface, borderRadius: theme.radius.md, border: `1px solid ${theme.color.border}`, padding: '16px 20px', cursor: 'pointer' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '10px' },
  cardLeft: { flex: 1, minWidth: 0 },
  cardTitle: { fontSize: '14.5px', fontWeight: 600, color: theme.color.ink, margin: '0 0 4px 0', fontFamily: theme.font.body },
  cardDesc: { fontSize: '13px', color: theme.color.inkSoft, margin: 0, fontFamily: theme.font.body, lineHeight: 1.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  projectTag: { fontSize: '11.5px', backgroundColor: theme.color.accentSoft, color: theme.color.accent, padding: '4px 10px', borderRadius: '20px', whiteSpace: 'nowrap', fontWeight: 600, fontFamily: theme.font.body, flexShrink: 0 },
  cardMeta: { display: 'flex', gap: '18px', alignItems: 'center', flexWrap: 'wrap' },
  metaItem: { fontSize: '13px', fontWeight: 500, display: 'inline-flex', alignItems: 'center', fontFamily: theme.font.body },
  metaDate: { fontSize: '12.5px', color: theme.color.inkFaint, fontFamily: theme.font.body },
  alertError: { backgroundColor: theme.color.dangerSoft, color: theme.color.danger, padding: '10px 14px', borderRadius: theme.radius.sm, marginBottom: '16px', fontSize: '13.5px', fontFamily: theme.font.body },
  loading: { textAlign: 'center', padding: '40px', color: theme.color.inkSoft, fontFamily: theme.font.body },
  empty: { padding: '40px', textAlign: 'center', color: theme.color.inkFaint, fontFamily: theme.font.body, backgroundColor: theme.color.surface, borderRadius: theme.radius.md, border: `1px dashed ${theme.color.border}` },
};

export default MyTasksPage;