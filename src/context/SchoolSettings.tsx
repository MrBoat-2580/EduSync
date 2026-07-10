import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type ThemeOption = 'indigo' | 'emerald' | 'violet' | 'amber';

type SchoolSettingsContextValue = {
  theme: ThemeOption;
  schoolName: string;
  isSettingsOpen: boolean;
  setTheme: (theme: ThemeOption) => void;
  setSchoolName: (schoolName: string) => void;
  openSettings: () => void;
  closeSettings: () => void;
};

const STORAGE_KEY = 'academic-dashboard-settings';
const defaultState = {
  theme: 'indigo' as ThemeOption,
  schoolName: 'TRINITY EDUCATIONAL COMPLEX',
};

const SchoolSettingsContext = createContext<SchoolSettingsContextValue | undefined>(undefined);

function loadSettings() {
  if (typeof window === 'undefined') return defaultState;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;

    const parsed = JSON.parse(raw) as Partial<typeof defaultState>;
    return {
      theme: parsed.theme ?? defaultState.theme,
      schoolName: parsed.schoolName?.trim() || defaultState.schoolName,
    };
  } catch {
    return defaultState;
  }
}

export function SchoolSettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeOption>(defaultState.theme);
  const [schoolName, setSchoolNameState] = useState(defaultState.schoolName);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const stored = loadSettings();
    setThemeState(stored.theme);
    setSchoolNameState(stored.schoolName);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme, schoolName }));
  }, [theme, schoolName]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.classList.remove('theme-indigo', 'theme-emerald', 'theme-violet', 'theme-amber');
    document.body.classList.add(`theme-${theme}`);
    document.title = `${schoolName} Admin`;
  }, [theme, schoolName]);

  const value = useMemo<SchoolSettingsContextValue>(
    () => ({
      theme,
      schoolName,
      isSettingsOpen,
      setTheme: (value) => setThemeState(value),
      setSchoolName: (value) => setSchoolNameState(value),
      openSettings: () => setIsSettingsOpen(true),
      closeSettings: () => setIsSettingsOpen(false),
    }),
    [theme, schoolName, isSettingsOpen],
  );

  return <SchoolSettingsContext.Provider value={value}>{children}</SchoolSettingsContext.Provider>;
}

export function useSchoolSettings() {
  const context = useContext(SchoolSettingsContext);
  if (!context) {
    throw new Error('useSchoolSettings must be used within a SchoolSettingsProvider');
  }
  return context;
}
