import { useEffect, useState } from 'react';
import { getDashboardSummary } from '../../api/dashboardApi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { theme } from '../../styles/theme';

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDashboardSummary();
        setData(res.data);
      } catch {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={s.loading}>Loading dashboard...</div>;
  if (error) return <div style={s.alertError}>{error}</div>;

  const statusData = data?.byStatus
    ? Object.entries(data.byStatus).map(([name, value]) => ({ name, value }))
    : [];

  const priorityData = data?.byPriority
    ? Object.entries(data.byPriority).map(([name, value]) => ({ name, value }))
    : [];

  const COLORS = [theme.color.accent, theme.color.warning, theme.color.success];

  return (
    <div style={s.page}>
      <h1 style={s.title}>Dashboard</h1>
      <p style={s.subtitle}>Overview of all tasks and project progress.</p>

      <div style={s.statsRow}>
        <StatCard label="Total tasks" value={data?.summary?.total ?? 0} color={theme.color.accent} />
        <StatCard label="Completed" value={data?.summary?.completed ?? 0} color={theme.color.success} />
        <StatCard label="In progress" value={data?.summary?.inProgress ?? 0} color={theme.color.warning} />
        <StatCard label="Overdue" value={data?.summary?.overdue ?? 0} color={theme.color.danger} />
      </div>

      <div style={s.chartsRow}>
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

      {data?.weeklyCompletion?.length > 0 && (
        <div style={s.sectionCard}>
          <h2 style={s.chartTitle}>Completed this week</h2>
          <p style={s.bigNumber}>{data.weeklyCompletion.length}</p>
          <p style={s.bigLabel}>tasks completed in the last 7 days</p>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, color }) => (
  <div style={{ ...s.statCard, borderTop: `3px solid ${color}` }}>
    <span style={s.statLabel}>{label}</span>
    <span style={{ ...s.statValue, color }}>{value}</span>
  </div>
);

const s = {
  page: { padding: '28px 28px', width: '100%', boxSizing: 'border-box' },
  title: { fontSize: '22px', fontWeight: 700, color: theme.color.ink, margin: '0 0 4px 0', fontFamily: theme.font.body, letterSpacing: '-0.01em' },
  subtitle: { fontSize: '13.5px', color: theme.color.inkSoft, margin: '0 0 22px 0', fontFamily: theme.font.body },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '22px' },
  statCard: { backgroundColor: theme.color.surface, borderRadius: theme.radius.md, border: `1px solid ${theme.color.border}`, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '8px' },
  statLabel: { fontSize: '11.5px', fontWeight: 600, color: theme.color.inkSoft, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: theme.font.body },
  statValue: { fontSize: '28px', fontWeight: 700, fontFamily: theme.font.body, lineHeight: 1 },
  chartsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
  chartCard: { backgroundColor: theme.color.surface, borderRadius: theme.radius.md, border: `1px solid ${theme.color.border}`, padding: '20px' },
  chartTitle: { fontSize: '14px', fontWeight: 600, color: theme.color.ink, margin: '0 0 16px 0', fontFamily: theme.font.body },
  sectionCard: { backgroundColor: theme.color.surface, borderRadius: theme.radius.md, border: `1px solid ${theme.color.border}`, padding: '24px', textAlign: 'center' },
  bigNumber: { fontSize: '48px', fontWeight: 700, color: theme.color.success, margin: '0 0 4px 0', fontFamily: theme.font.body },
  bigLabel: { fontSize: '14px', color: theme.color.inkSoft, margin: 0, fontFamily: theme.font.body },
  alertError: { backgroundColor: theme.color.dangerSoft, color: theme.color.danger, padding: '12px 16px', borderRadius: theme.radius.sm, margin: '28px 32px', fontSize: '13.5px', fontFamily: theme.font.body },
  loading: { textAlign: 'center', padding: '40px', color: theme.color.inkSoft, fontFamily: theme.font.body },
};

export default DashboardPage;