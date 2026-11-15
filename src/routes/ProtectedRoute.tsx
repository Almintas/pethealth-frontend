import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../features/auth';
import { RouteLoading } from './RouteLoading';

export function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return <RouteLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
