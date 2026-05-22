import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export const PublicOnlyRoute = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]" />
      </div>
    );
  }

  if (isAuthenticated && user?.role) {
    // Redirect authenticated users based on their role
    switch (user.role) {
      case 'ADMIN':
        return <Navigate to="/admin/dashboard" replace />;
      case 'DOCTOR':
        return <Navigate to="/doctor/appointments" replace />;
      case 'PATIENT':
      default:
        return <Navigate to="/doctors" replace />;
    }
  }

  return <Outlet />;
};
