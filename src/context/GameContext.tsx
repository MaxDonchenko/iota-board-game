import { createContext, useContext, ReactNode } from 'react';
import { useGameImplementation, PLAYER_COLORS, type UseGameReturn } from '../hooks/useGame';
import type { PlayerConfig } from '@/types/Game.types';
export { PLAYER_COLORS };
export type { PlayerConfig };

export const GameContext = createContext<UseGameReturn | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const game = useGameImplementation();
  return <GameContext.Provider value={game}>{children}</GameContext.Provider>;
}

export function useGameContext() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
}
