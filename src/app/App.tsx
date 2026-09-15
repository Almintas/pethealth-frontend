import { useState } from 'react';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { useAuth } from '../features/auth';
import { MainLayout } from '../layouts/MainLayout';
import { HomePage } from '../pages/HomePage';
import './app.css';

type AuthView = 'login' | 'register';

export default function App() {
  const { isAuthenticated, isInitializing } = useAuth();
  const [authView, setAuthView] = useState<AuthView>('login');

  if (isInitializing) {
    return (
      <div className="app">
        <MainLayout>
          <p className="app__loading">Loading…</p>
        </MainLayout>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="app">
        <MainLayout>
          <HomePage />
        </MainLayout>
      </div>
    );
  }

  return (
    <div className="app">
      <MainLayout>
        {authView === 'login' ? (
          <LoginPage onSwitchToRegister={() => setAuthView('register')} />
        ) : (
          <RegisterPage onSwitchToLogin={() => setAuthView('login')} />
        )}
      </MainLayout>
    </div>
  );
}
