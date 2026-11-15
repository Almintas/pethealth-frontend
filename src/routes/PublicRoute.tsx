import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../features/auth';
import { RouteLoading } from './RouteLoading';

export function PublicRoute() {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return <RouteLoading />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
