import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../styles/theme';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ProfilePage() {
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async () => {
    setMessage(null);
    setError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE}/users/me`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  const fullName = user?.first_name && user?.last_name
    ? `${user.first_name} ${user.last_name}`
    : '—';

  return (
    <div style={s.page}>
      <h1 style={s.title}>My profile</h1>
      <p style={s.subtitle}>Manage your account details and password.</p>

      <div style={s.grid}>
        <div style={s.card}>
          <h2 style={s.sectionTitle}>Account information</h2>
          <Row label="Name" value={fullName} />
          <Row label="Email" value={user?.email || '—'} />
          <Row label="Role" value={<span style={s.roleBadge}>{user?.role || '—'}</span>} />

          <div style={s.infoNote}>
            Need to update your name or email? Contact an administrator.
          </div>
        </div>

        <div style={s.card}>
          <h2 style={s.sectionTitle}>Change password</h2>

          {message && <div style={s.alertSuccess}>{message}</div>}
          {error && <div style={s.alertError}>{error}</div>}

          <div style={s.field}>
            <label style={s.label}>Current password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={s.input}
              placeholder="Enter current password"
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={s.input}
              placeholder="Enter new password"
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>Confirm new password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={s.input}
              placeholder="Confirm new password"
            />
          </div>

          <button onClick={handlePasswordChange} disabled={loading} style={loading ? s.btnDisabled : s.btn}>
            {loading ? 'Saving...' : 'Change password'}
          </button>
        </div>
      </div>
    </div>
  );
}

const Row = ({ label, value }) => (
  <div style={s.row}>
    <span style={s.rowLabel}>{label}</span>
    <span style={s.rowValue}>{value}</span>
  </div>
);

const s = {
  page: { padding: '28px 28px', width: '100%', boxSizing: 'border-box' },
  title: { fontFamily: theme.font.body, fontSize: '22px', fontWeight: 700, color: theme.color.ink, margin: '0 0 4px 0', letterSpacing: '-0.01em' },
  subtitle: { fontSize: '13.5px', color: theme.color.inkSoft, margin: '0 0 24px 0', fontFamily: theme.font.body },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
    gap: '18px',
    alignItems: 'start',
  },
  card: { backgroundColor: theme.color.surface, borderRadius: theme.radius.md, border: `1px solid ${theme.color.border}`, padding: '24px' },
  sectionTitle: { fontSize: '15px', fontWeight: 600, color: theme.color.ink, marginBottom: '18px', marginTop: 0, fontFamily: theme.font.body },
  row: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px' },
  rowLabel: { width: '90px', fontSize: '13px', color: theme.color.inkSoft, fontFamily: theme.font.body, flexShrink: 0 },
  rowValue: { fontSize: '14px', color: theme.color.ink, fontFamily: theme.font.body },
  roleBadge: { backgroundColor: theme.color.accentSoft, color: theme.color.accent, padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 },
  infoNote: { marginTop: '20px', paddingTop: '16px', borderTop: `1px solid ${theme.color.border}`, fontSize: '12.5px', color: theme.color.inkFaint, fontFamily: theme.font.body, lineHeight: 1.5 },
  field: { marginBottom: '16px' },
  label: { display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500, color: theme.color.ink, fontFamily: theme.font.body },
  input: { width: '100%', padding: '9px 12px', border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.sm, fontSize: '13.5px', boxSizing: 'border-box', fontFamily: theme.font.body, outline: 'none' },
  btn: { backgroundColor: theme.color.accent, color: '#fff', padding: '9px 18px', border: 'none', borderRadius: theme.radius.sm, fontSize: '13.5px', fontWeight: 500, cursor: 'pointer', fontFamily: theme.font.body, width: '100%' },
  btnDisabled: { backgroundColor: theme.color.borderStrong, color: '#fff', padding: '9px 18px', border: 'none', borderRadius: theme.radius.sm, fontSize: '13.5px', fontWeight: 500, cursor: 'not-allowed', fontFamily: theme.font.body, width: '100%' },
  alertSuccess: { backgroundColor: theme.color.successSoft, color: theme.color.success, padding: '10px 14px', borderRadius: theme.radius.sm, marginBottom: '14px', fontSize: '13.5px', fontFamily: theme.font.body },
  alertError: { backgroundColor: theme.color.dangerSoft, color: theme.color.danger, padding: '10px 14px', borderRadius: theme.radius.sm, marginBottom: '14px', fontSize: '13.5px', fontFamily: theme.font.body },
};