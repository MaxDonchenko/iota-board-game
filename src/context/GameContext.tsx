import { createContext, useContext, ReactNode } from 'react';
import { useGame, PLAYER_COLORS, type PlayerConfig } from '../hooks/useGame';
export { PLAYER_COLORS };
export type { PlayerConfig };

type GameContextType = ReturnType<typeof useGame>;

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const game = useGame();
  return <GameContext.Provider value={game}>{children}</GameContext.Provider>;
}

export function useGameContext() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
}
