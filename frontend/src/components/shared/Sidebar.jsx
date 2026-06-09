import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const allNavItems = [
  { label: 'Dashboard', path: '/dashboard', roles: ['Admin', 'Project Manager', 'Collaborator'] },
  { label: 'Projects', path: '/projects', roles: ['Admin', 'Project Manager'] },
  { label: 'Tasks', path: '/tasks', roles: ['Admin', 'Project Manager', 'Collaborator'] },
  { label: 'Kanban Board', path: '/tasks/kanban', roles: ['Admin', 'Project Manager', 'Collaborator'] },
  { label: 'Notifications', path: '/notifications', roles: ['Admin', 'Project Manager', 'Collaborator'] },
  { label: 'Users', path: '/users', roles: ['Admin'] },
  { label: 'Profile', path: '/profile', roles: ['Admin', 'Project Manager', 'Collaborator'] },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const navItems = allNavItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  return (
    <div style={styles.sidebar}>
      <div style={styles.logo}>TMS</div>
      <nav>
        {navItems.map((item) => (
          <div
            key={item.path}
            style={{
              ...styles.navItem,
              ...(location.pathname === item.path ? styles.activeNavItem : {}),
            }}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </div>
        ))}
      </nav>
    </div>
  );
};

const styles = {
  sidebar: {
    width: '220px',
    backgroundColor: '#1a1a2e',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
  },
  logo: {
    padding: '20px 24px',
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#fff',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    letterSpacing: '2px',
  },
  navItem: {
    padding: '14px 24px',
    color: 'rgba(255,255,255,0.7)',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s',
  },
  activeNavItem: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#fff',
    borderLeft: '3px solid #4f46e5',
  },
};

export default Sidebar;