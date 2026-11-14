import { lazy, Suspense, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes } from 'react-router';
import { LoadingState } from '../components/feedback';
import { ActivateAccountPage } from '../features/auth/pages/ActivateAccountPage';
import { ForgotPasswordPage } from '../features/auth/pages/ForgotPasswordPage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { ResetPasswordPage } from '../features/auth/pages/ResetPasswordPage';
import { AuthenticatedLayout } from '../layouts/AuthenticatedLayout';
import { MainLayout } from '../layouts/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { RootRedirect } from './RootRedirect';

/*
 * Authenticated pages are code-split so the login/register screens do not
 * download the whole application up front.
 */
const HomePage = lazy(() =>
  import('../pages/HomePage').then((module) => ({ default: module.HomePage })),
);
const PetsPage = lazy(() =>
  import('../features/pets/pages/PetsPage').then((module) => ({
    default: module.PetsPage,
  })),
);
const PetDetailsPage = lazy(() =>
  import('../features/pets/pages/PetDetailsPage').then((module) => ({
    default: module.PetDetailsPage,
  })),
);
const ProfilePage = lazy(() =>
  import('../features/account/pages/ProfilePage').then((module) => ({
    default: module.ProfilePage,
  })),
);
const SettingsPage = lazy(() =>
  import('../features/account/pages/SettingsPage').then((module) => ({
    default: module.SettingsPage,
  })),
);

function LazyPage({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  return (
    <Suspense fallback={<LoadingState message={t('common.loading')} skeleton />}>
      {children}
    </Suspense>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      {/* Reachable signed in or out: the emailed link must always work. */}
      <Route
        path="/activate-account"
        element={
          <MainLayout>
            <ActivateAccountPage />
          </MainLayout>
        }
      />

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
        <Route
          path="/forgot-password"
          element={
            <MainLayout>
              <ForgotPasswordPage />
            </MainLayout>
          }
        />
      </Route>

      {/* Reached from emailed links, so it must work whether or not someone is signed in. */}
      <Route
        path="/reset-password"
        element={
          <MainLayout>
            <ResetPasswordPage />
          </MainLayout>
        }
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<AuthenticatedLayout />}>
          <Route
            path="/dashboard"
            element={
              <LazyPage>
                <HomePage />
              </LazyPage>
            }
          />
          <Route
            path="/pets"
            element={
              <LazyPage>
                <PetsPage />
              </LazyPage>
            }
          />
          <Route
            path="/pets/:id"
            element={
              <LazyPage>
                <PetDetailsPage />
              </LazyPage>
            }
          />
          <Route
            path="/profile"
            element={
              <LazyPage>
                <ProfilePage />
              </LazyPage>
            }
          />
          <Route
            path="/settings"
            element={
              <LazyPage>
                <SettingsPage />
              </LazyPage>
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
