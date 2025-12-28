import type { UseCase } from './types';

export const allFourCards: UseCase = {
  name: 'All Four Cards',
  description: 'Playing all 4 cards in one turn',
  gameState: { phase: 'playing' },
};

