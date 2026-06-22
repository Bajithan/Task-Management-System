import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, getHomeRouteForRole } from '../../context/AuthContext';
import authApi from '../../api/authApi';
import { theme } from '../../styles/theme';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      login(res.data.user, res.data.token);
      navigate(getHomeRouteForRole(res.data.user.role));
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logoBlock}>
          <span style={s.logo}>Task Management System</span>
        </div>

        <h1 style={s.title}>Sign in</h1>
        <p style={s.subtitle}>Enter your credentials to continue.</p>

        {error && <div style={s.alertError}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={s.field}>
            <label style={s.label}>Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={s.input}
              placeholder="you@example.com"
              required
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={s.input}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" style={loading ? s.btnDisabled : s.btn} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p
          style={s.forgotLink}
          onClick={() => navigate('/reset-password')}
        >
          Forgot your password?
        </p>
      </div>
    </div>
  );
};

const s = {
  page: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: theme.color.bg },
  card: { backgroundColor: theme.color.surface, border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.lg, padding: '36px', width: '100%', maxWidth: '380px' },
  logoBlock: { textAlign: 'center', marginBottom: '28px' },
  logo: { fontFamily: theme.font.body, fontSize: '22px', fontWeight: 700, color: theme.color.ink, letterSpacing: '-0.01em' },
  logoSub: { fontSize: '12.5px', color: theme.color.inkFaint, margin: '4px 0 0 0', fontFamily: theme.font.body },
  title: { fontSize: '20px', fontWeight: 700, color: theme.color.ink, margin: '0 0 4px 0', fontFamily: theme.font.body, letterSpacing: '-0.01em' },
  subtitle: { fontSize: '13.5px', color: theme.color.inkSoft, margin: '0 0 22px 0', fontFamily: theme.font.body },
  field: { marginBottom: '16px' },
  label: { display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500, color: theme.color.ink, fontFamily: theme.font.body },
  input: { width: '100%', padding: '10px 12px', border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.sm, fontSize: '13.5px', boxSizing: 'border-box', fontFamily: theme.font.body, outline: 'none', color: theme.color.ink },
  btn: { width: '100%', padding: '11px', backgroundColor: theme.color.accent, color: '#fff', border: 'none', borderRadius: theme.radius.sm, fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: theme.font.body, marginTop: '4px' },
  btnDisabled: { width: '100%', padding: '11px', backgroundColor: theme.color.borderStrong, color: '#fff', border: 'none', borderRadius: theme.radius.sm, fontSize: '14px', fontWeight: 600, cursor: 'not-allowed', fontFamily: theme.font.body, marginTop: '4px' },
  alertError: { backgroundColor: theme.color.dangerSoft, color: theme.color.danger, padding: '10px 12px', borderRadius: theme.radius.sm, marginBottom: '16px', fontSize: '13.5px', fontFamily: theme.font.body },
  forgotLink: { textAlign: 'center', marginTop: '18px', color: theme.color.accent, cursor: 'pointer', fontSize: '13.5px', fontFamily: theme.font.body },
};

export default LoginPage;