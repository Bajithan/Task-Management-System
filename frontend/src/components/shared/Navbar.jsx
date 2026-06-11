import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// MEMBER 4 — import NotificationBell here after your branch merges:
import NotificationBell from '../notifications/NotificationBell';

const Navbar = ({ title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.navbar}>
      <h2 style={styles.title}>{title || 'Task Management System'}</h2>
      <div style={styles.right}>
        
        {/* MEMBER 4 — place NotificationBell here: */}
        <NotificationBell />
        
        <span style={styles.userInfo}>
          {user?.first_name} {user?.last_name} ({user?.role})
        </span>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 24px',
    height: '60px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  title: { fontSize: '18px', color: '#1a1a2e', margin: 0 },
  right: { display: 'flex', alignItems: 'center', gap: '16px' },
  userInfo: { fontSize: '14px', color: '#555' },
  logoutBtn: {
    padding: '6px 14px',
    backgroundColor: '#f0f0f0',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    color: '#333',
  },
};

export default Navbar;