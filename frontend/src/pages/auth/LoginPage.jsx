import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authApi from '../../api/authApi';

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
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Task Management System</h2>
        <h3 style={styles.subtitle}>Sign In</h3>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="Enter your email"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            style={loading ? styles.buttonDisabled : styles.button}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p
          style={styles.forgotLink}
          onClick={() => navigate('/reset-password')}
        >
          Forgot your password?
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f0f2f5',
  },
  card: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    textAlign: 'center',
    marginBottom: '4px',
    color: '#1a1a2e',
    fontSize: '20px',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: '24px',
    color: '#555',
    fontWeight: 'normal',
    fontSize: '16px',
  },
  field: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontSize: '14px',
    color: '#333',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '15px',
    cursor: 'pointer',
    marginTop: '8px',
  },
  buttonDisabled: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#a5a3e8',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '15px',
    cursor: 'not-allowed',
    marginTop: '8px',
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '10px 12px',
    borderRadius: '4px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  forgotLink: {
    textAlign: 'center',
    marginTop: '16px',
    color: '#4f46e5',
    cursor: 'pointer',
    fontSize: '14px',
  },
};

export default LoginPage;