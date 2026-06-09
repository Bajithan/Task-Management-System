import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import authApi from '../../api/authApi';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const tokenFromUrl = searchParams.get('token');
  const emailFromUrl = searchParams.get('email');

  const [step, setStep] = useState(tokenFromUrl ? 'reset' : 'request');
  const [email, setEmail] = useState(emailFromUrl || '');
  const [token, setToken] = useState(tokenFromUrl || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequest = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setMessage('If that email exists, a reset link has been sent.');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }
    if (newPassword.length < 8) {
      return setError('Password must be at least 8 characters');
    }

    setLoading(true);
    try {
      await authApi.resetPassword(email, token, newPassword);
      setMessage('Password reset successful. You can now log in.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Reset Password</h2>

        {message && <div style={styles.success}>{message}</div>}
        {error && <div style={styles.error}>{error}</div>}

        {step === 'request' && (
          <form onSubmit={handleRequest}>
            <div style={styles.field}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                placeholder="Enter your email"
                required
              />
            </div>
            <button
              type="submit"
              style={loading ? styles.buttonDisabled : styles.button}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleReset}>
            <div style={styles.field}>
              <label style={styles.label}>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={styles.input}
                placeholder="Enter new password"
                required
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={styles.input}
                placeholder="Confirm new password"
                required
              />
            </div>
            <button
              type="submit"
              style={loading ? styles.buttonDisabled : styles.button}
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <p
          style={styles.backLink}
          onClick={() => navigate('/login')}
        >
          Back to Login
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
    marginBottom: '24px',
    color: '#1a1a2e',
  },
  field: { marginBottom: '16px' },
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
  },
  success: {
    backgroundColor: '#dcfce7',
    color: '#16a34a',
    padding: '10px 12px',
    borderRadius: '4px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '10px 12px',
    borderRadius: '4px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  backLink: {
    textAlign: 'center',
    marginTop: '16px',
    color: '#4f46e5',
    cursor: 'pointer',
    fontSize: '14px',
  },
};

export default ResetPasswordPage;