import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { GameSettings } from '@/types/Game.types';

interface SettingsContextType {
  settings: GameSettings;
  updateSettings: (settings: Partial<GameSettings>) => void;
  toggleGradients: () => void;
  toggleShowInvalidPlacements: () => void;
  setWildcardVariant: (variant: 'modern' | 'original') => void;
  setCardVariant: (variant: 'modern' | 'original') => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const DEFAULT_SETTINGS: GameSettings = {
  theme: 'light',
  useGradients: true,
  gameMode: 'full',
  showInvalidPlacements: true,
  wildcardVariant: 'modern',
  cardVariant: 'modern',
  enableWildcards: true,
};

const STORAGE_KEY = 'iota-game-settings';

function getInitialTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined' && window.matchMedia) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }
  return 'light';
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<GameSettings>(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Partial<GameSettings>;
        if (!parsed.theme) parsed.theme = getInitialTheme();
        return { ...DEFAULT_SETTINGS, ...parsed };
      } catch {
        return { ...DEFAULT_SETTINGS, theme: getInitialTheme() };
      }
    }
    return { ...DEFAULT_SETTINGS, theme: getInitialTheme() };
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const toggleGradients = () => updateSettings({ useGradients: !settings.useGradients });
  const toggleShowInvalidPlacements = () =>
    updateSettings({ showInvalidPlacements: !settings.showInvalidPlacements });
  const setWildcardVariant = (variant: 'modern' | 'original') =>
    updateSettings({ wildcardVariant: variant });
  const setCardVariant = (variant: 'modern' | 'original') =>
    updateSettings({ cardVariant: variant });

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        toggleGradients,
        toggleShowInvalidPlacements,
        setWildcardVariant,
        setCardVariant,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
