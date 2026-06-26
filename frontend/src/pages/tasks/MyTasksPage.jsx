import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTasks } from '../../api/tasksApi';
import { getProjectNames } from '../../api/projectsApi';
import usersApi from '../../api/usersApi';
import { useAuth } from '../../context/AuthContext';
import { useWebSocket } from '../../hooks/useWebSocket';
import { theme, statusColor, priorityColor } from '../../styles/theme';

const MyTasksPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState({});
  const [usersMap, setUsersMap] = useState({});
  const [activeTab, setActiveTab] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    fetchData();
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { socket } = useWebSocket();

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      fetchData();
    };

    socket.on('task-assigned', handleUpdate);
    socket.on('status-changed', handleUpdate);
    socket.on('task-updated', handleUpdate);
    socket.on('comment-added', handleUpdate);

    return () => {
      socket.off('task-assigned', handleUpdate);
      socket.off('status-changed', handleUpdate);
      socket.off('task-updated', handleUpdate);
      socket.off('comment-added', handleUpdate);
    };
  }, [socket]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch tasks assigned directly to the current collaborator
      const { data: assignedTasks } = await getTasks({ assigned_to: user.user_id });
      
      // 2. Extract unique project IDs from collaborator's tasks
      const projectIds = [...new Set(assignedTasks.map((t) => t.project_id).filter(Boolean))];

      // 3. Fetch all tasks for those projects in parallel
      const projectTasksPromises = projectIds.map((pid) => getTasks({ project_id: pid }));
      const projectTasksResponses = await Promise.all(projectTasksPromises);
      const allProjectTasks = projectTasksResponses.flatMap((res) => res.data || []);

      // 4. Combine and deduplicate tasks (assigned tasks + all tasks in active projects)
      const tasksMap = new Map();
      allProjectTasks.forEach((t) => tasksMap.set(t.task_id, t));
      assignedTasks.forEach((t) => tasksMap.set(t.task_id, t));
      setTasks(Array.from(tasksMap.values()));

      // 5. Fetch project name metadata
      try {
        const projRes = await getProjectNames();
        const map = {};
        projRes.data.forEach((p) => { map[p.project_id] = p.name; });
        setProjects(map);
      } catch (err) {
        console.error("Failed to load project names metadata:", err);
      }

      // 6. Fetch assignable users for displaying who tasks are allocated to
      try {
        const usersRes = await usersApi.getAssignableUsers();
        const map = {};
        usersRes.data.forEach((u) => { map[u.user_id] = `${u.first_name} ${u.last_name}`; });
        setUsersMap(map);
      } catch (err) {
        console.error("Failed to load user names list:", err);
      }

    } catch (err) {
      setError('Failed to load tasks and collaboration workspace');
    } finally {
      setLoading(false);
    }
  };

  // Group tasks by project_id
  const projectGroups = {};
  tasks.forEach((task) => {
    const pid = task.project_id || 'independent';
    if (!projectGroups[pid]) {
      projectGroups[pid] = [];
    }
    projectGroups[pid].push(task);
  });

  const activeTabsList = Object.keys(projectGroups).map((pid) => {
    if (pid === 'independent') {
      return { id: 'independent', name: 'Independent Tasks' };
    }
    return { id: pid, name: projects[pid] || `Project #${pid}` };
  });

  // Auto-select tab when tasks/projects load
  useEffect(() => {
    if (activeTabsList.length > 0) {
      const activeExists = activeTabsList.some((tab) => String(tab.id) === String(activeTab));
      if (!activeExists) {
        setActiveTab(String(activeTabsList[0].id));
      }
    } else {
      setActiveTab('');
    }
  }, [tasks, projects, activeTab]);

  const activeTasks = projectGroups[activeTab] || [];
  const todo = activeTasks.filter((t) => t.status === 'To Do');
  const inProgress = activeTasks.filter((t) => t.status === 'In Progress');
  const completed = activeTasks.filter((t) => t.status === 'Completed');

  const getAssigneeName = (userId) => {
    if (!userId) return 'Unassigned';
    if (userId === user.user_id) return 'Me';
    return usersMap[userId] || 'Loading...';
  };

  // Stats summary for the collaborator
  const myAssignedCount = tasks.filter((t) => t.assigned_to === user.user_id).length;
  const myInProgressCount = tasks.filter((t) => t.assigned_to === user.user_id && t.status === 'In Progress').length;
  const activeProjectsCount = activeTabsList.filter(tab => tab.id !== 'independent').length;

  const isMobile = windowWidth <= 768;

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.title}>Workspace & Collaboration</h1>
        <p style={s.subtitle}>Review tasks grouped by project. You can view details and comment on any sibling tasks in your active projects.</p>
      </div>

      <div style={s.statsRow}>
        <StatCard label="Active Projects" value={activeProjectsCount} color={theme.color.accent} />
        <StatCard label="Tasks Assigned to Me" value={myAssignedCount} color={theme.color.inkSoft} />
        <StatCard label="My Tasks In Progress" value={myInProgressCount} color={theme.color.warning} />
      </div>

      {error && <div style={s.alertError}>{error}</div>}

      {loading ? (
        <div style={s.loading}>Loading collaboration workspace...</div>
      ) : activeTabsList.length === 0 ? (
        <div style={s.empty}>You do not have any tasks assigned, and there are no active projects to collaborate on.</div>
      ) : (
        <>
          <div style={s.tabsContainer}>
            <div style={s.tabsLabel}>PROJECTS:</div>
            <div style={s.tabs}>
              {activeTabsList.map((tab) => {
                const count = projectGroups[tab.id]?.length || 0;
                const active = String(activeTab) === String(tab.id);
                return (
                  <button
                    key={tab.id}
                    style={active ? s.tabActive : s.tab}
                    onClick={() => setActiveTab(String(tab.id))}
                  >
                    {tab.name}
                    <span style={active ? s.tabBadgeActive : s.tabBadge}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ ...s.board, flexDirection: isMobile ? 'column' : 'row' }}>
            <BoardColumn 
              label="To Do" 
              items={todo} 
              color={theme.color.inkSoft} 
              currentUserId={user.user_id} 
              getAssigneeName={getAssigneeName}
              navigate={navigate}
              isMobile={isMobile}
            />
            <BoardColumn 
              label="In Progress" 
              items={inProgress} 
              color={theme.color.accent} 
              currentUserId={user.user_id} 
              getAssigneeName={getAssigneeName}
              navigate={navigate}
              isMobile={isMobile}
            />
            <BoardColumn 
              label="Completed" 
              items={completed} 
              color={theme.color.success} 
              currentUserId={user.user_id} 
              getAssigneeName={getAssigneeName}
              navigate={navigate}
              isMobile={isMobile}
            />
          </div>
        </>
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

const BoardColumn = ({ label, items, color, currentUserId, getAssigneeName, navigate, isMobile }) => (
  <div style={{ ...s.column, minWidth: isMobile ? 'auto' : '280px', width: isMobile ? '100%' : 'auto' }}>
    <div style={{ ...s.columnHeader, borderTop: `3px solid ${color}` }}>
      <span>{label}</span>
      <span style={s.badge}>{items.length}</span>
    </div>
    <div style={s.taskCardList}>
      {items.map((task) => (
        <TaskCard 
          key={task.task_id} 
          task={task} 
          currentUserId={currentUserId} 
          getAssigneeName={getAssigneeName}
          navigate={navigate}
        />
      ))}
      {items.length === 0 && (
        <div style={s.columnEmpty}>No tasks in this stage</div>
      )}
    </div>
  </div>
);

const TaskCard = ({ task, currentUserId, getAssigneeName, navigate }) => {
  const [hovered, setHovered] = useState(false);
  const isMe = task.assigned_to === currentUserId;

  return (
    <div
      style={{
        ...s.taskCard,
        ...(isMe ? s.myTaskCard : {}),
        ...(hovered ? s.taskCardHover : {}),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/tasks/${task.task_id}`)}
    >
      <div style={s.cardHeader}>
        <h4 style={s.cardTitle}>{task.title}</h4>
        {isMe && <span style={s.meBadge}>Assigned to Me</span>}
      </div>
      
      {task.description && (
        <p style={s.cardDesc}>{task.description}</p>
      )}

      <div style={s.cardMetadata}>
        <div style={s.metaItem}>
          <span style={{ ...s.priorityDot, backgroundColor: priorityColor(task.priority) }} />
          <span style={{ fontSize: '11px', color: priorityColor(task.priority), fontWeight: 600 }}>{task.priority}</span>
        </div>
        <div style={s.metaRow}>
          <span style={s.metaLabel}>Allocated to:</span>
          <span style={{ ...s.metaVal, fontWeight: isMe ? 600 : 400, color: isMe ? theme.color.accent : theme.color.ink }}>
            {getAssigneeName(task.assigned_to)}
          </span>
        </div>
        <div style={s.metaRow}>
          <span style={s.metaLabel}>Deadline:</span>
          <span style={s.metaVal}>
            {task.due_date ? new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
          </span>
        </div>
      </div>
    </div>
  );
};

const s = {
  page: { padding: '28px 28px', width: '100%', boxSizing: 'border-box' },
  header: { marginBottom: '24px' },
  title: { fontSize: '22px', fontWeight: 700, color: theme.color.ink, margin: '0 0 6px 0', fontFamily: theme.font.body, letterSpacing: '-0.015em' },
  subtitle: { fontSize: '13.5px', color: theme.color.inkSoft, margin: 0, fontFamily: theme.font.body, lineHeight: 1.5 },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' },
  statCard: { backgroundColor: theme.color.surface, borderRadius: theme.radius.md, border: `1px solid ${theme.color.border}`, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px' },
  statLabel: { fontSize: '11px', fontWeight: 600, color: theme.color.inkSoft, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: theme.font.body },
  statValue: { fontSize: '28px', fontWeight: 700, fontFamily: theme.font.body, lineHeight: 1.1 },
  tabsContainer: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '22px' },
  tabsLabel: { fontSize: '11.5px', fontWeight: 700, color: theme.color.inkSoft, letterSpacing: '0.05em', fontFamily: theme.font.body },
  tabs: { display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'thin' },
  tab: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: theme.color.surface, border: `1px solid ${theme.color.border}`, borderRadius: '24px', cursor: 'pointer', fontSize: '13.5px', fontWeight: 500, color: theme.color.inkSoft, fontFamily: theme.font.body, whiteSpace: 'nowrap', transition: 'all 0.15s ease' },
  tabActive: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: theme.color.accent, border: `1px solid ${theme.color.accent}`, borderRadius: '24px', cursor: 'pointer', fontSize: '13.5px', fontWeight: 600, color: '#fff', fontFamily: theme.font.body, whiteSpace: 'nowrap', transition: 'all 0.15s ease', boxShadow: '0 4px 10px rgba(99, 102, 241, 0.2)' },
  tabBadge: { backgroundColor: theme.color.bg, color: theme.color.inkSoft, padding: '2px 7px', borderRadius: '10px', fontSize: '11px', fontWeight: 600 },
  tabBadgeActive: { backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#fff', padding: '2px 7px', borderRadius: '10px', fontSize: '11px', fontWeight: 600 },
  board: { display: 'flex', gap: '16px', alignItems: 'flex-start' },
  column: { flex: 1, backgroundColor: theme.color.surface, borderRadius: theme.radius.md, padding: '16px', minWidth: '280px', border: `1px solid ${theme.color.border}`, alignSelf: 'stretch', display: 'flex', flexDirection: 'column' },
  columnHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0 14px 0', fontWeight: 600, fontSize: '14px', color: theme.color.ink, fontFamily: theme.font.body },
  badge: { backgroundColor: theme.color.bg, color: theme.color.inkSoft, padding: '2px 8px', borderRadius: '20px', fontSize: '12px', fontFamily: theme.font.body, fontWeight: 500 },
  taskCardList: { display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, minHeight: '150px' },
  taskCard: { backgroundColor: theme.color.bg, borderRadius: theme.radius.md, padding: '14px', border: `1px solid ${theme.color.border}`, cursor: 'pointer', transition: 'all 0.15s ease', display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative' },
  taskCardHover: { transform: 'translateY(-2px)', boxShadow: '0 6px 12px rgba(0, 0, 0, 0.04)', borderColor: theme.color.borderStrong },
  myTaskCard: { borderLeft: `4px solid ${theme.color.accent}`, backgroundColor: 'rgba(99, 102, 241, 0.03)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' },
  cardTitle: { fontSize: '14px', fontWeight: 600, color: theme.color.ink, margin: 0, fontFamily: theme.font.body, lineHeight: 1.35 },
  meBadge: { fontSize: '10px', fontWeight: 600, color: theme.color.accent, backgroundColor: theme.color.accentSoft, padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap' },
  cardDesc: { fontSize: '12.5px', color: theme.color.inkSoft, margin: 0, fontFamily: theme.font.body, lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' },
  cardMetadata: { display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '8px', borderTop: `1px solid ${theme.color.border}` },
  metaRow: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontFamily: theme.font.body },
  metaLabel: { color: theme.color.inkSoft },
  metaVal: { color: theme.color.ink, fontWeight: 500 },
  metaItem: { display: 'flex', alignItems: 'center', gap: '5px' },
  priorityDot: { width: '6px', height: '6px', borderRadius: '50%' },
  columnEmpty: { padding: '24px 12px', textAlign: 'center', color: theme.color.inkFaint, fontSize: '12.5px', fontFamily: theme.font.body, border: `1px dashed ${theme.color.border}`, borderRadius: theme.radius.sm, backgroundColor: '#FAFBFB' },
  loading: { textAlign: 'center', padding: '60px', color: theme.color.inkSoft, fontFamily: theme.font.body, fontSize: '14px' },
  empty: { padding: '60px 20px', textAlign: 'center', color: theme.color.inkSoft, fontFamily: theme.font.body, fontSize: '14px', backgroundColor: theme.color.surface, borderRadius: theme.radius.md, border: `1px dashed ${theme.color.border}` },
  alertError: { backgroundColor: theme.color.dangerSoft, color: theme.color.danger, padding: '12px 16px', borderRadius: theme.radius.sm, marginBottom: '20px', fontSize: '13.5px', fontFamily: theme.font.body },
};

export default MyTasksPage;