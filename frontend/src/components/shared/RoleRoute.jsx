import { Navigate } from 'react-router-dom';
import { useAuth, getHomeRouteForRole } from '../../context/AuthContext';

const RoleRoute = ({ element, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (user?.must_reset_password) {
    return <Navigate to="/force-reset-password" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={getHomeRouteForRole(user.role)} replace />;
  }

  return element;
};

export default RoleRoute;