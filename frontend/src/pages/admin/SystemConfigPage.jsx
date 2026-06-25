import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSystemConfig } from '../../api/dashboardApi';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { theme } from '../../styles/theme';

const SystemConfigPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await getSystemConfig();
        setData(res.data);
      } catch (err) {
        setError('Failed to load system configuration');
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div style={s.alertError}>{error}</div>;

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.title}>System configuration & security</h1>
        <button style={s.secondaryBtn} onClick={() => navigate('/users')}>
          Back to users
        </button>
      </div>

      <div style={s.statsRow}>
        <StatCard label="Total users" value={data.totalUsers} color={theme.color.accent} />
        <StatCard label="Active users" value={data.activeUsers} color={theme.color.success} />
        <StatCard label="Inactive users" value={data.inactiveUsers} color={theme.color.danger} />
        <StatCard label="Total projects" value={data.totalProjects} color={theme.color.accent} />
        <StatCard label="Total tasks" value={data.totalTasks} color={theme.color.warning} />
      </div>

      <div style={s.section}>
        <h2 style={s.sectionTitle}>Security measures</h2>
        <div style={s.securityGrid}>
          <SecurityItem label="Password hashing" value="bcrypt, 12 salt rounds" />
          <SecurityItem label="JWT authentication" value="Signed tokens with expiration" />
          <SecurityItem label="Role based access control" value="Enforced on all protected routes" />
          <SecurityItem label="Rate limiting" value="Active on all API endpoints" />
          <SecurityItem label="Input sanitization" value="Active on incoming requests" />
          <SecurityItem label="HTTPS / TLS" value="Enforced in production" />
          <SecurityItem label="SQL injection prevention" value="Parameterized queries via Supabase" />
          <SecurityItem label="Audit logging" value="All significant actions logged" />
        </div>
      </div>

      <div style={s.section}>
        <h2 style={s.sectionTitle}>Recent audit logs</h2>
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Action</th>
                <th style={s.th}>User ID</th>
                <th style={s.th}>IP address</th>
                <th style={s.th}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {data.recentAuditLogs.map((log) => (
                <tr key={log.log_id} style={s.tr}>
                  <td style={s.td}>{log.action}</td>
                  <td style={s.tdMono}>{log.user_id || '—'}</td>
                  <td style={s.tdMono}>{log.ip_address || '—'}</td>
                  <td style={s.tdMono}>{new Date(log.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {data.recentAuditLogs.length === 0 && (
                <tr><td colSpan={4} style={s.empty}>No audit logs yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color }) => (
  <div style={{ ...s.statCard, borderLeft: `3px solid ${color}` }}>
    <span style={s.statLabel}>{label}</span>
    <span style={{ ...s.statValue, color }}>{value}</span>
  </div>
);

const SecurityItem = ({ label, value }) => (
  <div style={s.securityItem}>
    <div style={s.securityItemTop}>
      <span style={s.securityLabel}>{label}</span>
      <span style={s.badgeActive}>Active</span>
    </div>
    <span style={s.securityValue}>{value}</span>
  </div>
);

const s = {
  page: { padding: '28px 28px', width: '100%', boxSizing: 'border-box' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { fontFamily: theme.font.body, fontSize: '22px', fontWeight: 700, color: theme.color.ink, margin: 0, letterSpacing: '-0.01em' },
  secondaryBtn: { padding: '8px 16px', backgroundColor: theme.color.surface, color: theme.color.accent, border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.sm, cursor: 'pointer', fontSize: '13.5px', fontWeight: 500, fontFamily: theme.font.body },
  statsRow: { display: 'flex', gap: '14px', marginBottom: '24px', flexWrap: 'wrap' },
  statCard: { flex: '1 1 150px', backgroundColor: theme.color.surface, borderRadius: theme.radius.md, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '6px', border: `1px solid ${theme.color.border}` },
  statLabel: { fontSize: '12.5px', color: theme.color.inkSoft, fontFamily: theme.font.body },
  statValue: { fontSize: '22px', fontWeight: 700, fontFamily: theme.font.body },
  section: { backgroundColor: theme.color.surface, borderRadius: theme.radius.md, padding: '22px', marginBottom: '20px', border: `1px solid ${theme.color.border}` },
  sectionTitle: { fontSize: '15px', fontWeight: 600, color: theme.color.ink, marginBottom: '16px', marginTop: 0, fontFamily: theme.font.body },
  securityGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px' },
  securityItem: { border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.sm, padding: '12px 14px' },
  securityItemTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' },
  securityLabel: { fontSize: '13.5px', fontWeight: 500, color: theme.color.ink, fontFamily: theme.font.body },
  securityValue: { fontSize: '12.5px', color: theme.color.inkSoft, fontFamily: theme.font.body },
  badgeActive: { backgroundColor: theme.color.successSoft, color: theme.color.success, padding: '2px 8px', borderRadius: '20px', fontSize: '10.5px', fontWeight: 600, fontFamily: theme.font.body },
  tableWrap: { backgroundColor: theme.color.surface, borderRadius: theme.radius.sm, overflow: 'hidden', border: `1px solid ${theme.color.border}` },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '10px 14px', textAlign: 'left', backgroundColor: '#FAFAFB', fontSize: '11.5px', color: theme.color.inkSoft, fontWeight: 600, fontFamily: theme.font.body, borderBottom: `1px solid ${theme.color.border}` },
  tr: { borderBottom: `1px solid ${theme.color.border}` },
  td: { padding: '10px 14px', fontSize: '13px', color: theme.color.ink, fontFamily: theme.font.body },
  tdMono: { padding: '10px 14px', fontSize: '12px', color: theme.color.inkSoft, fontFamily: theme.font.mono },
  empty: { padding: '20px', textAlign: 'center', color: theme.color.inkFaint, fontFamily: theme.font.body },
  alertError: { backgroundColor: theme.color.dangerSoft, color: theme.color.danger, padding: '12px 16px', borderRadius: theme.radius.sm, margin: '28px', fontSize: '13.5px', fontFamily: theme.font.body },
};

export default SystemConfigPage;