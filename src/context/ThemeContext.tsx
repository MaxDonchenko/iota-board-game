import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useSettings } from './SettingsContext';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Theme is now stored in Settings; ThemeProvider assumes it's rendered inside a SettingsProvider
  const { settings, updateSettings } = useSettings();

  useEffect(() => {
    // Keep document data-theme in sync with settings.theme
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme !== settings.theme) {
      document.documentElement.setAttribute('data-theme', settings.theme);
    }
  }, [settings.theme]);

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' });
  };

  return (
    <ThemeContext.Provider value={{ theme: settings.theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
