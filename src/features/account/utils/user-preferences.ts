const STORAGE_KEY = 'pethealth.user-preferences.v1';

export type DateFormatPreference = 'DMY' | 'MDY' | 'YMD';
export type TimeFormatPreference = '12' | '24';

export type UserPreferences = {
  dateFormat: DateFormatPreference;
  timeFormat: TimeFormatPreference;
};

const DEFAULT_PREFERENCES: UserPreferences = {
  dateFormat: 'DMY',
  timeFormat: '24',
};

function isDateFormat(value: string): value is DateFormatPreference {
  return value === 'DMY' || value === 'MDY' || value === 'YMD';
}

function isTimeFormat(value: string): value is TimeFormatPreference {
  return value === '12' || value === '24';
}

export function loadUserPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_PREFERENCES;
    }
    const parsed = JSON.parse(raw) as Partial<UserPreferences>;
    const dateFormat = parsed.dateFormat ?? '';
    const timeFormat = parsed.timeFormat ?? '';

    return {
      dateFormat: isDateFormat(dateFormat)
        ? dateFormat
        : DEFAULT_PREFERENCES.dateFormat,
      timeFormat: isTimeFormat(timeFormat)
        ? timeFormat
        : DEFAULT_PREFERENCES.timeFormat,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveUserPreferences(preferences: UserPreferences): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}

export function formatSampleDate(
  preferences: UserPreferences,
  date = new Date(),
): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear());

  switch (preferences.dateFormat) {
    case 'MDY':
      return `${month}/${day}/${year}`;
    case 'YMD':
      return `${year}-${month}-${day}`;
    case 'DMY':
    default:
      return `${day}/${month}/${year}`;
  }
}

export function formatSampleTime(
  preferences: UserPreferences,
  date = new Date(),
): string {
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');

  if (preferences.timeFormat === '12') {
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  }

  return `${String(hours).padStart(2, '0')}:${minutes}`;
}
