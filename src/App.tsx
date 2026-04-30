import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FloatingIsland } from './components/FloatingIsland';
import { LandingPage } from './components/LandingPage';
import { ProtectedLayout } from './components/ProtectedLayout';
import { AdminLayout } from './components/AdminLayout';
import { MentorLayout } from './components/MentorLayout';
import { TasksPage } from './components/TasksPage';
import { TaskPage } from './components/TaskPage';
import { CoursesPage } from './components/CoursesPage';
import { ProfilePage } from './components/ProfilePage';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminUsers } from './components/AdminUsers';
import { MentorDashboard } from './components/MentorDashboard';
import { MentorStudents } from './components/MentorStudents';
import { MentorTaskReview } from './components/MentorTaskReview';
import type { UserRole } from './types';
import { NotFoundPage } from './components/NotFoundPage';

function RoleGuard({ allowedRoles, children }: { allowedRoles: UserRole[]; children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Загрузка...</div>;
  if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function AppContent() {
  return (
    // Убран глобальный отступ pt-20, так как FloatingIsland теперь только на /
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/40">
      <Routes>
        {/* 🔹 FloatingIsland рендерится ТОЛЬКО здесь */}
        <Route path="/" element={
          <>
            <FloatingIsland />
            <LandingPage />
          </>
        } />

        <Route path="/student" element={<RoleGuard allowedRoles={['student']}><ProtectedLayout /></RoleGuard>}>
          <Route index element={<Navigate to="tasks" replace />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="tasks/:id" element={<TaskPage />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route path="/admin" element={<RoleGuard allowedRoles={['admin']}><AdminLayout /></RoleGuard>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route path="/mentor" element={<RoleGuard allowedRoles={['mentor']}><MentorLayout /></RoleGuard>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<MentorDashboard />} />
          <Route path="students" element={<MentorStudents />} />
          <Route path="review" element={<MentorTaskReview />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}