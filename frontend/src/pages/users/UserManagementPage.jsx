import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import usersApi from '../../api/usersApi';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../styles/theme';

const ROLES = ['Admin', 'Project Manager', 'Collaborator'];

const UserManagementPage = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', role: 'Collaborator' });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await usersApi.getUsers(search, roleFilter);
      setUsers(res.data);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [search, roleFilter]);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.is_active).length;
    return { total, active, inactive: total - active };
  }, [users]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await usersApi.createUser(form);
      setSuccess(`User created successfully. Temporary Password: ${res.data.tempPassword} (An email has also been sent)`);
      setShowModal(false);
      setForm({ first_name: '', last_name: '', email: '', role: 'Collaborator' });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create user');
    }
  };

  const handleDeactivate = async (userId) => {
    if (!window.confirm('Deactivate this user?')) return;
    setError('');
    setSuccess('');
    try {
      await usersApi.deactivateUser(userId);
      setSuccess('User deactivated');
      fetchUsers();
    } catch (err) {
      setError('Failed to deactivate user');
    }
  };

  const handleResetPassword = async (userId) => {
    if (!window.confirm('Are you sure you want to reset this user\'s password? A new temporary password will be generated.')) return;
    setError('');
    setSuccess('');
    try {
      const res = await usersApi.resetUserPassword(userId);
      setSuccess(`Password reset successfully for ${res.data.user.first_name}. Temporary Password: ${res.data.tempPassword} (Copy this now. An email has also been sent)`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to reset password');
    }
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.title}>User management</h1>
        <button style={s.secondaryBtn} onClick={() => navigate('/system-config')}>
          System configuration
        </button>
      </div>

      <div style={s.statsRow}>
        <StatCard label="Total users" value={stats.total} color={theme.color.accent} />
        <StatCard label="Active users" value={stats.active} color={theme.color.success} />
        <StatCard label="Inactive users" value={stats.inactive} color={theme.color.danger} />
      </div>

      {error && <div style={s.alertError}>{error}</div>}
      {success && <div style={s.alertSuccess}>{success}</div>}

      <div style={s.toolbar}>
        <input
          style={s.searchInput}
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select style={s.select} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <button style={s.primaryBtn} onClick={() => setShowModal(true)}>+ Create user</button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Name</th>
                <th style={s.th}>Email</th>
                <th style={s.th}>Role</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.user_id} style={s.tr}>
                  <td style={s.td}>{user.first_name} {user.last_name}</td>
                  <td style={s.td}>{user.email}</td>
                  <td style={s.td}>{user.role}</td>
                  <td style={s.td}>
                    <span style={user.is_active ? s.statusActive : s.statusInactive}>
                      <span style={{ ...s.statusDot, backgroundColor: user.is_active ? theme.color.success : theme.color.danger }} />
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={s.td}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {user.is_active && user.user_id !== currentUser?.user_id && (
                        <button style={s.resetBtn} onClick={() => handleResetPassword(user.user_id)}>
                          Reset Password
                        </button>
                      )}
                      {user.is_active && user.user_id !== currentUser?.user_id && (
                        <button style={s.deactivateBtn} onClick={() => handleDeactivate(user.user_id)}>
                          Deactivate
                        </button>
                      )}
                      {user.user_id === currentUser?.user_id && (
                        <span style={{ color: theme.color.inkFaint, fontSize: '13px', fontStyle: 'italic' }}>Current User</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={5} style={s.empty}>No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h2 style={s.modalTitle}>Create new user</h2>
            {error && <div style={s.alertError}>{error}</div>}
            <form onSubmit={handleCreate}>
              {['first_name', 'last_name', 'email'].map((field) => (
                <div key={field} style={s.field}>
                  <label style={s.label}>
                    {field.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </label>
                  <input
                    style={s.input}
                    type={field === 'email' ? 'email' : 'text'}
                    value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    required
                  />
                </div>
              ))}
              <div style={s.field}>
                <label style={s.label}>Role</label>
                <select style={s.input} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div style={s.modalActions}>
                <button type="button" style={s.secondaryBtn} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" style={s.primaryBtn}>Create user</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, color }) => (
  <div style={{ ...s.statCard, borderLeft: `3px solid ${color}` }}>
    <span style={s.statLabel}>{label}</span>
    <span style={{ ...s.statValue, color }}>{value}</span>
  </div>
);

const s = {
  page: { padding: '28px 28px', width: '100%', boxSizing: 'border-box' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { fontFamily: theme.font.body, fontSize: '22px', fontWeight: 700, color: theme.color.ink, margin: 0, letterSpacing: '-0.01em' },
  secondaryBtn: { padding: '8px 16px', backgroundColor: theme.color.surface, color: theme.color.accent, border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.sm, cursor: 'pointer', fontSize: '13.5px', fontWeight: 500, fontFamily: theme.font.body },
  primaryBtn: { padding: '8px 16px', backgroundColor: theme.color.accent, color: '#fff', border: 'none', borderRadius: theme.radius.sm, cursor: 'pointer', fontSize: '13.5px', fontWeight: 500, fontFamily: theme.font.body },
  statsRow: { display: 'flex', gap: '14px', marginBottom: '22px' },
  statCard: { flex: 1, backgroundColor: theme.color.surface, borderRadius: theme.radius.md, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '6px', border: `1px solid ${theme.color.border}` },
  statLabel: { fontSize: '12.5px', color: theme.color.inkSoft, fontFamily: theme.font.body },
  statValue: { fontSize: '24px', fontWeight: 700, fontFamily: theme.font.body },
  toolbar: { display: 'flex', gap: '10px', marginBottom: '18px', flexWrap: 'wrap' },
  searchInput: { padding: '9px 12px', border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.sm, fontSize: '13.5px', flex: 1, minWidth: '220px', fontFamily: theme.font.body, outline: 'none' },
  select: { padding: '9px 12px', border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.sm, fontSize: '13.5px', fontFamily: theme.font.body, color: theme.color.ink },
  tableWrap: { backgroundColor: theme.color.surface, borderRadius: theme.radius.md, border: `1px solid ${theme.color.border}`, overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '11px 16px', textAlign: 'left', backgroundColor: '#FAFAFB', fontSize: '12px', color: theme.color.inkSoft, fontWeight: 600, fontFamily: theme.font.body, borderBottom: `1px solid ${theme.color.border}` },
  tr: { borderBottom: `1px solid ${theme.color.border}` },
  td: { padding: '13px 16px', fontSize: '13.5px', color: theme.color.ink, fontFamily: theme.font.body },
  empty: { padding: '28px', textAlign: 'center', color: theme.color.inkFaint, fontFamily: theme.font.body },
  statusActive: { display: 'inline-flex', alignItems: 'center', gap: '6px', color: theme.color.success, fontWeight: 500, fontSize: '13px' },
  statusInactive: { display: 'inline-flex', alignItems: 'center', gap: '6px', color: theme.color.danger, fontWeight: 500, fontSize: '13px' },
  statusDot: { width: '6px', height: '6px', borderRadius: '50%' },
  deactivateBtn: { padding: '5px 11px', backgroundColor: theme.color.dangerSoft, color: theme.color.danger, border: 'none', borderRadius: theme.radius.sm, cursor: 'pointer', fontSize: '12.5px', fontWeight: 500, fontFamily: theme.font.body },
  resetBtn: { padding: '5px 11px', backgroundColor: theme.color.accentSoft, color: theme.color.accent, border: 'none', borderRadius: theme.radius.sm, cursor: 'pointer', fontSize: '12.5px', fontWeight: 500, fontFamily: theme.font.body },
  alertError: { backgroundColor: theme.color.dangerSoft, color: theme.color.danger, padding: '10px 14px', borderRadius: theme.radius.sm, marginBottom: '16px', fontSize: '13.5px', fontFamily: theme.font.body },
  alertSuccess: { backgroundColor: theme.color.successSoft, color: theme.color.success, padding: '10px 14px', borderRadius: theme.radius.sm, marginBottom: '16px', fontSize: '13.5px', fontFamily: theme.font.body },
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { backgroundColor: theme.color.surface, padding: '28px', borderRadius: theme.radius.lg, width: '100%', maxWidth: '420px' },
  modalTitle: { fontSize: '17px', fontWeight: 700, color: theme.color.ink, marginBottom: '18px', fontFamily: theme.font.body },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px' },
  field: { marginBottom: '14px' },
  label: { display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500, color: theme.color.ink, fontFamily: theme.font.body },
  input: { width: '100%', padding: '9px 12px', border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.sm, fontSize: '13.5px', boxSizing: 'border-box', fontFamily: theme.font.body, outline: 'none' },
};

export default UserManagementPage;