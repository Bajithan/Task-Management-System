import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, getHomeRouteForRole } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import ProtectedRoute from './components/shared/ProtectedRoute';
import RoleRoute from './components/shared/RoleRoute';
import Navbar from './components/shared/Navbar';
import Sidebar from './components/shared/Sidebar';

import UserManagementPage from './pages/users/UserManagementPage';
import SystemConfigPage from './pages/admin/SystemConfigPage';
import ProjectsListPage from './pages/projects/ProjectsListPage';
import ProjectDetailPage from './pages/projects/ProjectDetailPage';
import TasksPage from './pages/tasks/TasksPage';
import TaskDetailPage from './pages/tasks/TaskDetailPage';
import MyTasksPage from './pages/tasks/MyTasksPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProfilePage from './pages/dashboard/ProfilePage';

const Layout = ({ children }) => {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Navbar />
        <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f0f2f5' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

const LayoutRoute = ({ element }) => <Layout>{element}</Layout>;

const HomeRedirect = () => {
  const { user } = useAuth();
  return <Navigate to={getHomeRouteForRole(user?.role)} replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomeRedirect />} />

          {/* Admin only */}
          <Route path="/users" element={
            <RoleRoute allowedRoles={['Admin']} element={<LayoutRoute element={<UserManagementPage />} />} />
          } />
          <Route path="/system-config" element={
            <RoleRoute allowedRoles={['Admin']} element={<LayoutRoute element={<SystemConfigPage />} />} />
          } />

          {/* Project Manager only */}
          <Route path="/dashboard" element={
            <RoleRoute allowedRoles={['Project Manager']} element={<LayoutRoute element={<DashboardPage />} />} />
          } />
          <Route path="/projects" element={
            <RoleRoute allowedRoles={['Project Manager']} element={<LayoutRoute element={<ProjectsListPage />} />} />
          } />
          <Route path="/projects/:id" element={
            <RoleRoute allowedRoles={['Project Manager']} element={<LayoutRoute element={<ProjectDetailPage />} />} />
          } />
          <Route path="/tasks" element={
            <RoleRoute allowedRoles={['Project Manager']} element={<LayoutRoute element={<TasksPage />} />} />
          } />

          {/* Collaborator only */}
          <Route path="/my-tasks" element={
            <RoleRoute allowedRoles={['Collaborator']} element={<LayoutRoute element={<MyTasksPage />} />} />
          } />

          {/* Shared: Project Manager + Collaborator */}
          <Route path="/tasks/:id" element={
            <RoleRoute allowedRoles={['Project Manager', 'Collaborator']} element={<LayoutRoute element={<TaskDetailPage />} />} />
          } />
          <Route path="/notifications" element={
            <RoleRoute allowedRoles={['Project Manager', 'Collaborator']} element={<LayoutRoute element={<NotificationsPage />} />} />
          } />

          {/* All roles */}
          <Route path="/profile" element={<LayoutRoute element={<ProfilePage />} />} />

          <Route path="*" element={<HomeRedirect />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;