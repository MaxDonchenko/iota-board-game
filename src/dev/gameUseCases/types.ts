import type { GameState } from '@/types/Game.types';

export interface UseCase {
  name: string;
  description: string;
  gameState: GameState;
}

