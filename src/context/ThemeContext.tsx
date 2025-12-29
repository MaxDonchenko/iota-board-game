import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { GameSettings } from '@/types/Game.types';

interface ThemeContextType {
  settings: GameSettings;
  updateSettings: (settings: Partial<GameSettings>) => void;
  toggleTheme: () => void;
  toggleGradients: () => void;
  toggleShowInvalidPlacements: () => void;
  setWildcardVariant: (variant: 'modern' | 'original') => void;
  setCardVariant: (variant: 'modern' | 'original') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const DEFAULT_SETTINGS: GameSettings = {
  theme: 'light',
  useGradients: true,
  gameMode: 'full',
  showInvalidPlacements: true,
  wildcardVariant: 'modern',
  cardVariant: 'modern',
};

const STORAGE_KEY = 'iota-game-settings';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<GameSettings>(() => {
    // Get initial theme from device preference
    const getInitialTheme = (): 'light' | 'dark' => {
      if (typeof window !== 'undefined' && window.matchMedia) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return prefersDark ? 'dark' : 'light';
      }
      return 'light';
    };

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Partial<GameSettings>;
        // If theme was never set by user, use device preference
        if (!parsed.theme) {
          parsed.theme = getInitialTheme();
        }
        return { ...DEFAULT_SETTINGS, ...parsed };
      } catch {
        return { ...DEFAULT_SETTINGS, theme: getInitialTheme() };
      }
    }
    return { ...DEFAULT_SETTINGS, theme: getInitialTheme() };
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

  const toggleShowInvalidPlacements = () => {
    setSettings(prev => ({
      ...prev,
      showInvalidPlacements: !prev.showInvalidPlacements,
    }));
  };

  const setWildcardVariant = (variant: 'modern' | 'original') => {
    setSettings(prev => ({
      ...prev,
      wildcardVariant: variant,
    }));
  };

  const setCardVariant = (variant: 'modern' | 'original') => {
    setSettings(prev => ({
      ...prev,
      cardVariant: variant,
    }));
  };

  return (
    <ThemeContext.Provider value={{ settings, updateSettings, toggleTheme, toggleGradients, toggleShowInvalidPlacements, setWildcardVariant, setCardVariant }}>
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

