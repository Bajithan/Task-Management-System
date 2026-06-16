import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import UserManagementPage from './pages/users/UserManagementPage';
import ProtectedRoute from './components/shared/ProtectedRoute';

import ProjectsListPage from './pages/projects/ProjectsListPage';
import ProjectDetailPage from './pages/projects/ProjectDetailPage';
// MEMBER 3 — import TasksPage, KanbanBoardPage, TaskDetailPage here
import TasksPage from './pages/tasks/TasksPage';
import KanbanBoardPage from './pages/tasks/KanbanBoardPage';
import TaskDetailPage from './pages/tasks/TaskDetailPage';

// MEMBER 4 — import NotificationsPage here
import NotificationsPage from './pages/NotificationsPage';

// MEMBER 5 — import DashboardPage and ProfilePage here
import DashboardPage from './pages/dashboard/DashboardPage';
import ProfilePage from './pages/dashboard/ProfilePage';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/users" element={<UserManagementPage />} />
          
          {/* MEMBER 2 — add your routes here */}
          { <Route path="/projects" element={<ProjectsListPage />} /> }
          {<Route path="/projects/:id" element={<ProjectDetailPage />} /> }
          
          {/* MEMBER 3 — add your routes here */}
          { <Route path="/tasks" element={<TasksPage />} /> }
          { <Route path="/tasks/kanban" element={<KanbanBoardPage />} /> }
          {<Route path="/tasks/:id" element={<TaskDetailPage />} /> }
          
          {/* MEMBER 4 — add your routes here */}
          {<Route path="/notifications" element={<NotificationsPage />} /> }
          
          {/* MEMBER 5 — add your routes here */}

          { <Route path="/dashboard" element={<DashboardPage />} /> }
          { <Route path="/profile" element={<ProfilePage />} /> }
        </Route>
      </Routes>
    </BrowserRouter>
);
}
export default App;