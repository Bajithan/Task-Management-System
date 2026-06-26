import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../styles/theme';

const allNavItems = [
  { label: 'Users', path: '/users', roles: ['Admin'] },
  { label: 'System config', path: '/system-config', roles: ['Admin'] },
  { label: 'Dashboard', path: '/dashboard', roles: ['Project Manager'] },
  { label: 'Projects', path: '/projects', roles: ['Project Manager'] },
  { label: 'Tasks', path: '/tasks', roles: ['Project Manager'] },
  { label: 'My tasks', path: '/my-tasks', roles: ['Collaborator'] },
  { label: 'Notifications', path: '/notifications', roles: ['Project Manager', 'Collaborator'] },
  { label: 'Profile', path: '/profile', roles: ['Admin', 'Project Manager', 'Collaborator'] },
];

const Sidebar = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const navItems = allNavItems.filter((item) => user && item.roles.includes(user.role));

  return (
    <div style={s.sidebar}>
      <div style={s.header}>
        <span style={s.logo}>Task Management System</span>
        <span style={s.roleBadge}>{user?.role}</span>
      </div>

      <nav style={s.nav}>
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <div
              key={item.path}
              style={{ ...s.navItem, ...(active ? s.navItemActive : {}) }}
              onClick={() => {
                navigate(item.path);
                if (onClose) onClose();
              }}
            >
              {item.label}
            </div>
          );
        })}
      </nav>
    </div>
  );
};

const s = {
  sidebar: {
    width: '224px',
    backgroundColor: theme.color.sidebar,
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
  },
  header: {
    padding: '24px 24px 20px 24px',
    borderBottom: `1px solid ${theme.color.sidebarBorder}`,
  },
  logo: {
    display: 'block',
    fontFamily: theme.font.body,
    fontSize: '17px',
    fontWeight: 700,
    color: '#fff',
    letterSpacing: '-0.01em',
    marginBottom: '8px',
  },
  roleBadge: {
    display: 'inline-block',
    fontFamily: theme.font.body,
    fontSize: '11px',
    fontWeight: 600,
    color: theme.color.accent,
    backgroundColor: 'rgba(99,102,241,0.15)',
    padding: '3px 9px',
    borderRadius: '20px',
    letterSpacing: '0.01em',
  },
  nav: {
    flex: 1,
    padding: '16px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  navItem: {
    padding: '10px 12px',
    borderRadius: theme.radius.sm,
    color: theme.color.sidebarText,
    cursor: 'pointer',
    fontFamily: theme.font.body,
    fontSize: '13.5px',
    fontWeight: 500,
    transition: 'background-color 0.15s, color 0.15s',
  },
  navItemActive: {
    backgroundColor: theme.color.sidebarActive,
    color: '#fff',
  },
};

export default Sidebar;