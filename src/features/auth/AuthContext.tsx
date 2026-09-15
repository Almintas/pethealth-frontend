import { useApolloClient } from '@apollo/client/react';
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import * as authService from './auth.service';
import type { AuthUser, LoginInput, RegisterInput } from './types';

export type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<AuthUser>;
  logout: () => Promise<void>;
  getAccessToken: () => string | null;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const client = useApolloClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      const currentUser = await authService.fetchCurrentUser(client);
      if (!cancelled) {
        setUser(currentUser);
        setIsInitializing(false);
      }
    };

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, [client]);

  const login = useCallback(
    async (input: LoginInput) => {
      const authenticatedUser = await authService.login(client, input);
      setUser(authenticatedUser);
    },
    [client],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      await authService.register(client, input);
      const authenticatedUser = await authService.login(client, {
        email: input.email,
        password: input.password,
      });
      setUser(authenticatedUser);
      return authenticatedUser;
    },
    [client],
  );

  const logout = useCallback(async () => {
    await authService.logout(client);
    setUser(null);
  }, [client]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isInitializing,
      login,
      register,
      logout,
      getAccessToken: authService.getAccessToken,
    }),
    [user, isInitializing, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
