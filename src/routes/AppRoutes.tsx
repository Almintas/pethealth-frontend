import { Navigate, Route, Routes } from 'react-router';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { AuthenticatedLayout } from '../layouts/AuthenticatedLayout';
import { MainLayout } from '../layouts/MainLayout';
import { PetsPage } from '../features/pets';
import { PetDetailsPage } from '../features/pets/pages/PetDetailsPage';
import { ProfilePage, SettingsPage } from '../features/account';
import { HomePage } from '../pages/HomePage';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { RootRedirect } from './RootRedirect';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      <Route element={<PublicRoute />}>
        <Route
          path="/login"
          element={
            <MainLayout>
              <LoginPage />
            </MainLayout>
          }
        />
        <Route
          path="/register"
          element={
            <MainLayout>
              <RegisterPage />
            </MainLayout>
          }
        />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AuthenticatedLayout />}>
          <Route path="/dashboard" element={<HomePage />} />
          <Route path="/pets" element={<PetsPage />} />
          <Route path="/pets/:id" element={<PetDetailsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
