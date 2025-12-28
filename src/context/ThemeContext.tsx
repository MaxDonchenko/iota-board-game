import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { GameSettings } from '@/types/Game.types';

interface ThemeContextType {
  settings: GameSettings;
  updateSettings: (settings: Partial<GameSettings>) => void;
  toggleTheme: () => void;
  toggleGradients: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const DEFAULT_SETTINGS: GameSettings = {
  theme: 'light',
  useGradients: true,
  gameMode: 'full',
};

const STORAGE_KEY = 'iota-game-settings';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<GameSettings>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    // Only update data-theme if it's different to avoid triggering observers unnecessarily
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme !== settings.theme) {
      document.documentElement.setAttribute('data-theme', settings.theme);
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const toggleTheme = () => {
    setSettings(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light',
    }));
  };

  const toggleGradients = () => {
    setSettings(prev => ({
      ...prev,
      useGradients: !prev.useGradients,
    }));
  };

  return (
    <ThemeContext.Provider value={{ settings, updateSettings, toggleTheme, toggleGradients }}>
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

