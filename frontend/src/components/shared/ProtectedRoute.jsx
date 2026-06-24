import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ allowPasswordResetPending = false }) => {
  const { token, user } = useAuth();

  if (!token) return <Navigate to="/login" replace />;

  if (user?.must_reset_password && !allowPasswordResetPending) {
    return <Navigate to="/force-reset-password" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;