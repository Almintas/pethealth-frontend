import { Navigate } from 'react-router';
import { useAuth } from '../features/auth';
import { RouteLoading } from './RouteLoading';

export function RootRedirect() {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return <RouteLoading />;
  }

  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
}
