import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { applyThemePreference } from './apply-theme';
import {
  DEFAULT_THEME_PREFERENCE,
  readStoredThemePreference,
  resolveTheme,
  writeStoredThemePreference,
  type ResolvedTheme,
  type ThemePreference,
} from './theme-storage';

export type ThemeContextValue = {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
  resolvedTheme: ResolvedTheme;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

type ThemeProviderProps = {
  children: ReactNode;
};

const SYSTEM_THEME_QUERY = '(prefers-color-scheme: dark)';

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemePreference>(() =>
    readStoredThemePreference(),
  );
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    resolveTheme(readStoredThemePreference()),
  );

  const setTheme = useCallback((next: ThemePreference) => {
    setThemeState(next);
    writeStoredThemePreference(next);
    const resolved = applyThemePreference(next);
    setResolvedTheme(resolved);
  }, []);

  useEffect(() => {
    if (theme !== 'system') {
      return;
    }

    const media = window.matchMedia(SYSTEM_THEME_QUERY);

    const handleChange = () => {
      const resolved = applyThemePreference('system');
      setResolvedTheme(resolved);
    };

    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      resolvedTheme,
    }),
    [theme, setTheme, resolvedTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider.');
  }
  return context;
}

/** For tests or rare cases outside React tree. */
export function getDefaultThemePreference(): ThemePreference {
  return DEFAULT_THEME_PREFERENCE;
}
