import { BrowserRouter, Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FloatingIsland } from './components/FloatingIsland';
import { LandingPage } from './components/LandingPage';
import { TasksPage } from './components/TasksPage';
import { PageTransition } from './components/PageTransition';
import { DashboardLayout } from './components/DashboardLayout';
import { ProfilePage } from './components/ProfilePage';

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <div key={location.pathname} className="relative w-full min-h-screen">
      <Routes location={location}>
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/tasks" element={<PageTransition><TasksPage /></PageTransition>} />
            <Route path="/profile" element={<PageTransition><ProfilePage /></PageTransition>} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/40 text-gray-900 relative overflow-hidden">
          <FloatingIsland />
          <AnimatedRoutes />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}