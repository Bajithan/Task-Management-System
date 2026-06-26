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
  
  // Persisted settings configuration state
  const [settings, setSettings] = useState({
    debugLogs: false,
    sessionDuration: '7d',
    rateLimit: 100,
    maintenanceMode: false
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

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

    // Load persisted settings
    const saved = localStorage.getItem('system_override_settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse local system settings", e);
      }
    }
  }, []);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('system_override_settings', JSON.stringify(settings));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const exportToCSV = () => {
    if (!data || !data.recentAuditLogs || data.recentAuditLogs.length === 0) return;
    const headers = ['Log ID', 'Action', 'User ID', 'IP Address', 'User Agent', 'Timestamp'];
    const rows = data.recentAuditLogs.map(log => [
      log.log_id,
      `"${log.action.replace(/"/g, '""')}"`,
      log.user_id || 'N/A',
      log.ip_address || 'N/A',
      `"${(log.user_agent || 'N/A').replace(/"/g, '""')}"`,
      new Date(log.created_at).toLocaleString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `system_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div style={s.alertError}>{error}</div>;

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>System configuration & security</h1>
          <p style={s.subtitle}>Monitor diagnostic counts, verify encryption layers, adjust session details, and audit usage actions.</p>
        </div>
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
        <h2 style={s.sectionTitle}>System configurations (Admin overrides)</h2>
        {saveSuccess && <div style={s.alertSuccess}>Settings updated and persisted successfully!</div>}
        <form onSubmit={handleSaveSettings} style={s.settingsForm}>
          <div style={s.formRow}>
            <div style={s.formField}>
              <label style={s.fieldLabel}>JWT Session Expiry Duration</label>
              <select 
                style={s.selectInput} 
                value={settings.sessionDuration} 
                onChange={(e) => setSettings({ ...settings, sessionDuration: e.target.value })}
              >
                <option value="1d">1 Day</option>
                <option value="7d">7 Days</option>
                <option value="30d">30 Days</option>
              </select>
            </div>
            <div style={s.formField}>
              <label style={s.fieldLabel}>API Rate Limit threshold (requests / 15m)</label>
              <input 
                type="number" 
                style={s.textInput} 
                value={settings.rateLimit} 
                onChange={(e) => setSettings({ ...settings, rateLimit: Number(e.target.value) })}
                min="1"
              />
            </div>
          </div>
          <div style={s.checkboxRow}>
            <label style={s.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={settings.debugLogs} 
                onChange={(e) => setSettings({ ...settings, debugLogs: e.target.checked })}
                style={s.checkbox}
              />
              Enable verbose server-side debugger logging
            </label>
            <label style={s.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={settings.maintenanceMode} 
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                style={s.checkbox}
              />
              Enable Maintenance Mode (Restricted Write Actions)
            </label>
          </div>
          <button type="submit" style={s.primaryBtn}>Save configurations</button>
        </form>
      </div>

      <div style={s.section}>
        <div style={s.tableHeader}>
          <h2 style={{ ...s.sectionTitle, margin: 0 }}>Recent audit logs</h2>
          <button 
            style={s.csvBtn} 
            onClick={exportToCSV}
            disabled={!data?.recentAuditLogs || data.recentAuditLogs.length === 0}
          >
            📥 Export audit logs (CSV)
          </button>
        </div>
        
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
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' },
  title: { fontFamily: theme.font.body, fontSize: '22px', fontWeight: 700, color: theme.color.ink, margin: '0 0 6px 0', letterSpacing: '-0.015em' },
  subtitle: { fontSize: '13.5px', color: theme.color.inkSoft, margin: 0, fontFamily: theme.font.body },
  secondaryBtn: { padding: '8px 16px', backgroundColor: theme.color.surface, color: theme.color.accent, border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.sm, cursor: 'pointer', fontSize: '13.5px', fontWeight: 500, fontFamily: theme.font.body, transition: 'all 0.15s' },
  statsRow: { display: 'flex', gap: '14px', marginBottom: '24px', flexWrap: 'wrap' },
  statCard: { flex: '1 1 150px', backgroundColor: theme.color.surface, borderRadius: theme.radius.md, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '6px', border: `1px solid ${theme.color.border}` },
  statLabel: { fontSize: '12px', fontWeight: 600, color: theme.color.inkSoft, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: theme.font.body },
  statValue: { fontSize: '26px', fontWeight: 700, fontFamily: theme.font.body },
  section: { backgroundColor: theme.color.surface, borderRadius: theme.radius.md, padding: '22px', marginBottom: '20px', border: `1px solid ${theme.color.border}` },
  sectionTitle: { fontSize: '15px', fontWeight: 600, color: theme.color.ink, marginBottom: '16px', marginTop: 0, fontFamily: theme.font.body },
  securityGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' },
  securityItem: { border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.sm, padding: '12px 14px', backgroundColor: theme.color.bg },
  securityItemTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' },
  securityLabel: { fontSize: '13.5px', fontWeight: 600, color: theme.color.ink, fontFamily: theme.font.body },
  securityValue: { fontSize: '12.5px', color: theme.color.inkSoft, fontFamily: theme.font.body },
  badgeActive: { backgroundColor: theme.color.successSoft, color: theme.color.success, padding: '2px 8px', borderRadius: '20px', fontSize: '10.5px', fontWeight: 600, fontFamily: theme.font.body },
  
  // Settings Form styles
  settingsForm: { display: 'flex', flexDirection: 'column', gap: '16px' },
  formRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' },
  formField: { display: 'flex', flexDirection: 'column', gap: '6px' },
  fieldLabel: { fontSize: '13px', fontWeight: 500, color: theme.color.ink, fontFamily: theme.font.body },
  selectInput: { padding: '9px 12px', border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.sm, fontSize: '13.5px', fontFamily: theme.font.body, backgroundColor: '#FFF', outline: 'none', color: theme.color.ink },
  textInput: { padding: '9px 12px', border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.sm, fontSize: '13.5px', fontFamily: theme.font.body, backgroundColor: '#FFF', outline: 'none', color: theme.color.ink },
  checkboxRow: { display: 'flex', gap: '24px', flexWrap: 'wrap', marginTop: '4px' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: theme.color.inkSoft, fontFamily: theme.font.body, cursor: 'pointer' },
  checkbox: { width: '16px', height: '16px', cursor: 'pointer' },
  primaryBtn: { alignSelf: 'flex-start', padding: '9px 18px', backgroundColor: theme.color.accent, color: '#fff', border: 'none', borderRadius: theme.radius.sm, cursor: 'pointer', fontSize: '13.5px', fontWeight: 600, fontFamily: theme.font.body, transition: 'background-color 0.15s' },
  alertSuccess: { backgroundColor: theme.color.successSoft, color: theme.color.success, padding: '10px 14px', borderRadius: theme.radius.sm, marginBottom: '16px', fontSize: '13.5px', fontFamily: theme.font.body, border: `1px solid ${theme.color.success}24` },

  // Audit Logs table header styles
  tableHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' },
  csvBtn: { padding: '7px 14px', backgroundColor: theme.color.accentSoft, color: theme.color.accent, border: 'none', borderRadius: theme.radius.sm, cursor: 'pointer', fontSize: '12.5px', fontWeight: 600, fontFamily: theme.font.body, transition: 'all 0.15s' },

  tableWrap: { backgroundColor: theme.color.surface, borderRadius: theme.radius.sm, overflow: 'hidden', border: `1px solid ${theme.color.border}` },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '10px 14px', textAlign: 'left', backgroundColor: '#FAFAFB', fontSize: '11.5px', color: theme.color.inkSoft, fontWeight: 600, fontFamily: theme.font.body, borderBottom: `1px solid ${theme.color.border}` },
  tr: { borderBottom: `1px solid ${theme.color.border}`, transition: 'background-color 0.1s' },
  td: { padding: '10px 14px', fontSize: '13px', color: theme.color.ink, fontFamily: theme.font.body },
  tdMono: { padding: '10px 14px', fontSize: '12px', color: theme.color.inkSoft, fontFamily: theme.font.mono },
  empty: { padding: '20px', textAlign: 'center', color: theme.color.inkFaint, fontFamily: theme.font.body },
  alertError: { backgroundColor: theme.color.dangerSoft, color: theme.color.danger, padding: '12px 16px', borderRadius: theme.radius.sm, margin: '28px', fontSize: '13.5px', fontFamily: theme.font.body },
};

export default SystemConfigPage;