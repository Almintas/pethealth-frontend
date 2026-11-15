import type { ResolvedTheme, ThemePreference } from './theme-storage';
import { resolveTheme } from './theme-storage';

const META_THEME_COLOR: Record<ResolvedTheme, string> = {
  light: '#f4f6f8',
  dark: '#0f1419',
};

export function applyResolvedTheme(resolved: ResolvedTheme): void {
  const root = document.documentElement;
  root.setAttribute('data-theme', resolved);
  root.style.colorScheme = resolved;

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', META_THEME_COLOR[resolved]);
  }
}

export function applyThemePreference(preference: ThemePreference): ResolvedTheme {
  const resolved = resolveTheme(preference);
  applyResolvedTheme(resolved);
  return resolved;
}
