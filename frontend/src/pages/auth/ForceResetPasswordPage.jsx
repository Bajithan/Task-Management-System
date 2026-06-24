import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, getHomeRouteForRole } from '../../context/AuthContext';
import authApi from '../../api/authApi';
import { theme } from '../../styles/theme';

const ForceResetPasswordPage = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Password validation state
  const [validations, setValidations] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });

  useEffect(() => {
    setValidations({
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      number: /\d/.test(newPassword),
      specialChar: /[@$!%*?&]/.test(newPassword),
    });
  }, [newPassword]);

  const isValid = Object.values(validations).every(Boolean) && newPassword === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (!Object.values(validations).every(Boolean)) {
      return setError('Password does not meet all complexity requirements');
    }

    setLoading(true);
    try {
      const res = await authApi.forceResetPassword(currentPassword, newPassword);
      setSuccess('Password updated successfully! Logging you in...');
      
      // Update session credentials
      setTimeout(() => {
        login(res.data.user, res.data.token);
        navigate(getHomeRouteForRole(res.data.user.role));
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Password update failed');
    } finally {
      setLoading(false);
    }
  };

  const validationCriteria = [
    { label: 'At least 8 characters', met: validations.length },
    { label: 'At least one uppercase letter (A-Z)', met: validations.uppercase },
    { label: 'At least one lowercase letter (a-z)', met: validations.lowercase },
    { label: 'At least one number (0-9)', met: validations.number },
    { label: 'At least one special character (@, $, !, %, *, ?, &)', met: validations.specialChar },
  ];

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logoBlock}>
          <span style={s.logo}>Security Verification</span>
        </div>

        <h1 style={s.title}>Reset temporary password</h1>
        <p style={s.subtitle}>
          Your account is currently using a temporary password. You must update your password to continue.
        </p>

        {error && <div style={s.alertError}>{error}</div>}
        {success && <div style={s.alertSuccess}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div style={s.field}>
            <label style={s.label}>Current Temporary Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={s.input}
              placeholder="Enter temporary password"
              required
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={s.input}
              placeholder="Enter secure password"
              required
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={s.input}
              placeholder="Confirm new password"
              required
            />
          </div>

          {/* Password Validation Checklist */}
          <div style={s.checklist}>
            <p style={s.checklistTitle}>Password Strength Requirements:</p>
            {validationCriteria.map((criterion, idx) => (
              <div key={idx} style={s.checkItem}>
                <span style={{
                  ...s.bullet,
                  backgroundColor: criterion.met ? theme.color.success : theme.color.borderStrong
                }} />
                <span style={{
                  ...s.checkText,
                  color: criterion.met ? theme.color.success : theme.color.inkSoft
                }}>
                  {criterion.label}
                </span>
              </div>
            ))}
            {newPassword && confirmPassword && (
              <div style={s.checkItem}>
                <span style={{
                  ...s.bullet,
                  backgroundColor: newPassword === confirmPassword ? theme.color.success : theme.color.danger
                }} />
                <span style={{
                  ...s.checkText,
                  color: newPassword === confirmPassword ? theme.color.success : theme.color.danger
                }}>
                  Passwords match
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            style={(!isValid || loading) ? s.btnDisabled : s.btn}
            disabled={!isValid || loading}
          >
            {loading ? 'Updating Password...' : 'Update Password & Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

const s = {
  page: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: theme.color.bg, padding: '20px', boxSizing: 'border-box' },
  card: { backgroundColor: theme.color.surface, border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.lg, padding: '36px', width: '100%', maxWidth: '420px', boxSizing: 'border-box' },
  logoBlock: { textAlign: 'center', marginBottom: '20px' },
  logo: { fontFamily: theme.font.body, fontSize: '20px', fontWeight: 700, color: theme.color.ink, letterSpacing: '-0.01em' },
  title: { fontSize: '18px', fontWeight: 700, color: theme.color.ink, margin: '0 0 4px 0', fontFamily: theme.font.body },
  subtitle: { fontSize: '13px', color: theme.color.inkSoft, margin: '0 0 20px 0', fontFamily: theme.font.body, lineHeight: '1.4' },
  field: { marginBottom: '14px' },
  label: { display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500, color: theme.color.ink, fontFamily: theme.font.body },
  input: { width: '100%', padding: '9px 12px', border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.sm, fontSize: '13.5px', boxSizing: 'border-box', fontFamily: theme.font.body, outline: 'none', color: theme.color.ink },
  btn: { width: '100%', padding: '11px', backgroundColor: theme.color.accent, color: '#fff', border: 'none', borderRadius: theme.radius.sm, fontSize: '13.5px', fontWeight: 600, cursor: 'pointer', fontFamily: theme.font.body, marginTop: '12px' },
  btnDisabled: { width: '100%', padding: '11px', backgroundColor: theme.color.borderStrong, color: '#fff', border: 'none', borderRadius: theme.radius.sm, fontSize: '13.5px', fontWeight: 600, cursor: 'not-allowed', fontFamily: theme.font.body, marginTop: '12px' },
  alertError: { backgroundColor: theme.color.dangerSoft, color: theme.color.danger, padding: '10px 12px', borderRadius: theme.radius.sm, marginBottom: '14px', fontSize: '13px', fontFamily: theme.font.body },
  alertSuccess: { backgroundColor: theme.color.successSoft, color: theme.color.success, padding: '10px 12px', borderRadius: theme.radius.sm, marginBottom: '14px', fontSize: '13px', fontFamily: theme.font.body },
  checklist: { backgroundColor: '#fcfcfd', border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.sm, padding: '12px 14px', marginBottom: '16px' },
  checklistTitle: { fontSize: '12px', fontWeight: 600, color: theme.color.ink, margin: '0 0 8px 0', fontFamily: theme.font.body },
  checkItem: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' },
  bullet: { width: '6px', height: '6px', borderRadius: '50%', display: 'inline-block' },
  checkText: { fontSize: '12px', fontFamily: theme.font.body },
};

export default ForceResetPasswordPage;
