import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../notifications/NotificationBell';
import { theme } from '../../styles/theme';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}` : '';

  return (
    <div style={s.navbar}>
      <span style={s.brand}>Task Management System</span>
      <div style={s.right}>
        <NotificationBell />
        <div style={s.userBlock}>
          <div style={s.avatar}>{initials}</div>
          <div style={s.userText}>
            <span style={s.userName}>{user?.first_name} {user?.last_name}</span>
            <span style={s.userRole}>{user?.role}</span>
          </div>
        </div>
        <button style={s.logoutBtn} onClick={handleLogout}>Log out</button>
      </div>
    </div>
  );
};

const s = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 28px',
    height: '60px',
    backgroundColor: theme.color.surface,
    borderBottom: `1px solid ${theme.color.border}`,
    flexShrink: 0,
  },
  brand: {
    fontFamily: theme.font.body,
    fontSize: '14.5px',
    fontWeight: 600,
    color: theme.color.ink,
  },
  right: { display: 'flex', alignItems: 'center', gap: '18px' },
  userBlock: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    backgroundColor: theme.color.accentSoft,
    color: theme.color.accent,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 600,
    fontFamily: theme.font.body,
  },
  userText: { display: 'flex', flexDirection: 'column', lineHeight: 1.3 },
  userName: { fontSize: '13px', fontWeight: 500, color: theme.color.ink, fontFamily: theme.font.body },
  userRole: { fontSize: '11px', color: theme.color.inkFaint, fontFamily: theme.font.body },
  logoutBtn: {
    padding: '7px 14px',
    backgroundColor: 'transparent',
    border: `1px solid ${theme.color.border}`,
    borderRadius: theme.radius.sm,
    cursor: 'pointer',
    fontSize: '13px',
    color: theme.color.inkSoft,
    fontFamily: theme.font.body,
    fontWeight: 500,
  },
};

export default Navbar;