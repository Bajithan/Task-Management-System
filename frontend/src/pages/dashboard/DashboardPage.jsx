import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardSummary } from '../../api/dashboardApi';
import { getProjectNames } from '../../api/projectsApi';
import usersApi from '../../api/usersApi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { theme, priorityColor } from '../../styles/theme';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [projectNames, setProjectNames] = useState({});
  const [usersMap, setUsersMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [summaryRes, projectsRes, usersRes] = await Promise.all([
          getDashboardSummary(),
          getProjectNames(),
          usersApi.getAssignableUsers()
        ]);
        setData(summaryRes.data);

        // Map project names
        const projMap = {};
        projectsRes.data.forEach(p => {
          projMap[p.project_id] = p.name;
        });
        setProjectNames(projMap);

        // Map users
        const usrMap = {};
        usersRes.data.forEach(u => {
          usrMap[u.user_id] = `${u.first_name} ${u.last_name}`;
        });
        setUsersMap(usrMap);
      } catch (err) {
        console.error("Dashboard page loading failed:", err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) return <div style={s.loading}>Loading dashboard statistics...</div>;
  if (error) return <div style={s.alertError}>{error}</div>;

  const statusData = data?.byStatus
    ? Object.entries(data.byStatus).map(([name, value]) => ({ name, value }))
    : [];

  const priorityData = data?.byPriority
    ? Object.entries(data.byPriority).map(([name, value]) => ({ name, value }))
    : [];

  const COLORS = [theme.color.accent, theme.color.warning, theme.color.success];
  const isMobile = windowWidth <= 768;

  return (
    <div style={s.page}>
      {/* 1. Welcome Gradient Hero */}
      <div style={s.hero}>
        <h1 style={s.heroTitle}>Welcome back, Project Manager!</h1>
        <p style={s.heroSubtitle}>Here is the current operational health of your team's workspace and active project tasks.</p>
      </div>

      {/* 2. Interactive Stats Cards */}
      <div style={s.statsRow}>
        <StatCard label="Total Tasks" value={data?.summary?.total ?? 0} color={theme.color.accent} />
        <StatCard label="Completed" value={data?.summary?.completed ?? 0} color={theme.color.success} />
        <StatCard label="In Progress" value={data?.summary?.inProgress ?? 0} color={theme.color.warning} />
        <StatCard label="Overdue" value={data?.summary?.overdue ?? 0} color={theme.color.danger} />
      </div>

      <div style={{ ...s.contentGrid, gridTemplateColumns: isMobile ? '1fr' : '1.2fr 0.8fr' }}>
        <div style={s.leftCol}>
          {/* 3. Charts */}
          <div style={{ ...s.chartsRow, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
            <div style={s.chartCard}>
              <h2 style={s.chartTitle}>Tasks by status</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={statusData} barSize={32}>
                  <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: theme.font.body }} />
                  <YAxis tick={{ fontSize: 12, fontFamily: theme.font.body }} />
                  <Tooltip />
                  <Bar dataKey="value" fill={theme.color.accent} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={s.chartCard}>
              <h2 style={s.chartTitle}>Tasks by priority</h2>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={priorityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label>
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 4. Active Projects Progress Tracker List */}
          {data?.projectProgress && Object.keys(data.projectProgress).length > 0 && (
            <div style={s.sectionCard}>
              <h2 style={s.chartTitle}>Active Projects Status & Completion</h2>
              <div style={s.projectList}>
                {Object.entries(data.projectProgress).map(([pid, progress]) => {
                  const name = pid === 'null' || pid === 'undefined' ? 'Independent Sibling Tasks' : (projectNames[pid] || `Project #${pid}`);
                  const pct = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;
                  return (
                    <div key={pid} style={s.projectItem}>
                      <div style={s.projectItemHeader}>
                        <span style={s.projectName}>{name}</span>
                        <span style={s.projectPercent}>{pct}% ({progress.completed}/{progress.total} tasks)</span>
                      </div>
                      <div style={s.progressTrack}>
                        <div style={{ ...s.progressBar, width: `${pct}%`, backgroundColor: pct === 100 ? theme.color.success : theme.color.accent }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div style={s.rightCol}>
          {/* 5. Overdue Tasks Attention Feed */}
          {data?.overdueTasksList?.length > 0 ? (
            <div style={s.alertSectionCard}>
              <h2 style={{ ...s.chartTitle, color: theme.color.danger, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span>⚠️ Overdue Tasks</span>
                <span style={s.alertBadge}>{data.overdueTasksList.length}</span>
              </h2>
              <div style={s.overdueList}>
                {data.overdueTasksList.slice(0, 6).map((t) => (
                  <div key={t.task_id} style={s.overdueItem}>
                    <div style={s.overdueInfo}>
                      <span style={s.overdueTitle} onClick={() => navigate(`/tasks/${t.task_id}`)}>{t.title}</span>
                      <span style={s.overdueMeta}>
                        Due {new Date(t.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • Assigned to: {usersMap[t.assigned_to] || 'Unassigned'}
                      </span>
                    </div>
                    <div style={s.overdueAction}>
                      <span style={{ ...s.priorityBadge, color: priorityColor(t.priority), backgroundColor: `${priorityColor(t.priority)}12` }}>{t.priority}</span>
                      <button style={s.viewTaskBtn} onClick={() => navigate(`/tasks/${t.task_id}`)}>Review</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={s.noOverdueCard}>
              <span style={{ fontSize: '28px', marginBottom: '8px' }}>🎉</span>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600, color: theme.color.success }}>All tasks are on track!</h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: theme.color.inkSoft }}>There are currently no overdue tasks in your workspace.</p>
            </div>
          )}

          {/* 6. Weekly completions summary */}
          {data?.weeklyCompletion?.length > 0 && (
            <div style={s.weeklyCard}>
              <h3 style={s.weeklyTitle}>Completed this week</h3>
              <p style={s.bigNumber}>{data.weeklyCompletion.length}</p>
              <p style={s.bigLabel}>tasks resolved in the last 7 days</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div 
      style={{ 
        ...s.statCard, 
        borderTop: `3px solid ${color}`,
        ...(hovered ? s.statCardHover : {}) 
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={s.statLabel}>{label}</span>
      <span style={{ ...s.statValue, color }}>{value}</span>
    </div>
  );
};

const s = {
  page: { padding: '28px 28px', width: '100%', boxSizing: 'border-box' },
  
  // Hero Gradient Banner
  hero: {
    background: 'linear-gradient(135deg, #4F46E5, #6366F1)',
    borderRadius: theme.radius.lg,
    padding: '24px 28px',
    color: '#FFFFFF',
    marginBottom: '24px',
    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.25)',
  },
  heroTitle: { fontSize: '22px', fontWeight: 700, margin: '0 0 6px 0', fontFamily: theme.font.body, letterSpacing: '-0.015em' },
  heroSubtitle: { fontSize: '13.5px', margin: 0, opacity: 0.9, fontFamily: theme.font.body, lineHeight: 1.45 },
  
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '22px' },
  statCard: { backgroundColor: theme.color.surface, borderRadius: theme.radius.md, border: `1px solid ${theme.color.border}`, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '8px', transition: 'all 0.15s ease' },
  statCardHover: { transform: 'translateY(-2px)', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.03)' },
  statLabel: { fontSize: '11px', fontWeight: 600, color: theme.color.inkSoft, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: theme.font.body },
  statValue: { fontSize: '28px', fontWeight: 700, fontFamily: theme.font.body, lineHeight: 1 },
  
  contentGrid: { display: 'grid', gap: '16px', alignItems: 'start' },
  leftCol: { display: 'flex', flexDirection: 'column', gap: '16px' },
  rightCol: { display: 'flex', flexDirection: 'column', gap: '16px' },
  
  chartsRow: { display: 'grid', gap: '16px' },
  chartCard: { backgroundColor: theme.color.surface, borderRadius: theme.radius.md, border: `1px solid ${theme.color.border}`, padding: '20px' },
  chartTitle: { fontSize: '14.5px', fontWeight: 600, color: theme.color.ink, margin: '0 0 16px 0', fontFamily: theme.font.body },
  
  sectionCard: { backgroundColor: theme.color.surface, borderRadius: theme.radius.md, border: `1px solid ${theme.color.border}`, padding: '20px' },
  
  // Projects completion list styles
  projectList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  projectItem: { display: 'flex', flexDirection: 'column', gap: '6px' },
  projectItemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  projectName: { fontSize: '13.5px', fontWeight: 600, color: theme.color.ink, fontFamily: theme.font.body },
  projectPercent: { fontSize: '12px', color: theme.color.inkSoft, fontFamily: theme.font.body },
  progressTrack: { height: '8px', backgroundColor: theme.color.bg, borderRadius: '4px', overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: '4px', transition: 'width 0.4s ease' },
  
  // Overdue Task Alerts panel styles
  alertSectionCard: { backgroundColor: theme.color.surface, borderRadius: theme.radius.md, border: `1px solid ${theme.color.danger}24`, padding: '20px' },
  alertBadge: { backgroundColor: theme.color.danger, color: '#fff', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', fontFamily: theme.font.body },
  overdueList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  overdueItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.sm, backgroundColor: theme.color.bg, gap: '12px' },
  overdueInfo: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: 0 },
  overdueTitle: { fontSize: '13.5px', fontWeight: 600, color: theme.color.ink, fontFamily: theme.font.body, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', cursor: 'pointer' },
  overdueMeta: { fontSize: '12px', color: theme.color.inkSoft, fontFamily: theme.font.body },
  overdueAction: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 },
  priorityBadge: { fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '4px', textTransform: 'capitalize', fontFamily: theme.font.body },
  viewTaskBtn: { padding: '5px 11px', backgroundColor: theme.color.accentSoft, color: theme.color.accent, border: 'none', borderRadius: theme.radius.sm, cursor: 'pointer', fontSize: '12px', fontWeight: 600, fontFamily: theme.font.body },
  
  // Alternative on-track panel
  noOverdueCard: { backgroundColor: theme.color.surface, borderRadius: theme.radius.md, border: `1px solid ${theme.color.success}24`, padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', fontFamily: theme.font.body },
  
  // Weekly completions card
  weeklyCard: { backgroundColor: theme.color.surface, borderRadius: theme.radius.md, border: `1px solid ${theme.color.border}`, padding: '24px', textAlign: 'center' },
  weeklyTitle: { fontSize: '14px', fontWeight: 600, color: theme.color.ink, margin: '0 0 12px 0', fontFamily: theme.font.body },
  bigNumber: { fontSize: '48px', fontWeight: 700, color: theme.color.success, margin: '0 0 4px 0', fontFamily: theme.font.body, lineHeight: 1 },
  bigLabel: { fontSize: '13px', color: theme.color.inkSoft, margin: 0, fontFamily: theme.font.body },
  
  alertError: { backgroundColor: theme.color.dangerSoft, color: theme.color.danger, padding: '12px 16px', borderRadius: theme.radius.sm, margin: '28px', fontSize: '13.5px', fontFamily: theme.font.body },
  loading: { textAlign: 'center', padding: '60px', color: theme.color.inkSoft, fontFamily: theme.font.body, fontSize: '14px' },
};

export default DashboardPage;