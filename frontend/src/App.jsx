import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import UserManagementPage from './pages/users/UserManagementPage';
import ProtectedRoute from './components/shared/ProtectedRoute';
import Navbar from './components/shared/Navbar';
import Sidebar from './components/shared/Sidebar';

import ProjectsListPage from './pages/projects/ProjectsListPage';
import ProjectDetailPage from './pages/projects/ProjectDetailPage';
import TasksPage from './pages/tasks/TasksPage';
import KanbanBoardPage from './pages/tasks/KanbanBoardPage';
import TaskDetailPage from './pages/tasks/TaskDetailPage';
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

const LayoutRoute = ({ element }) => {
  return (
    <Layout>
      {element}
    </Layout>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/dashboard" element={<LayoutRoute element={<DashboardPage />} />} />
          <Route path="/profile" element={<LayoutRoute element={<ProfilePage />} />} />
          <Route path="/users" element={<LayoutRoute element={<UserManagementPage />} />} />
          <Route path="/projects" element={<LayoutRoute element={<ProjectsListPage />} />} />
          <Route path="/projects/:id" element={<LayoutRoute element={<ProjectDetailPage />} />} />
          <Route path="/tasks" element={<LayoutRoute element={<TasksPage />} />} />
          <Route path="/tasks/kanban" element={<LayoutRoute element={<KanbanBoardPage />} />} />
          <Route path="/tasks/:id" element={<LayoutRoute element={<TaskDetailPage />} />} />
          <Route path="/notifications" element={<LayoutRoute element={<NotificationsPage />} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;