import type { UseCase } from './types';

export const finalTurn: UseCase = {
  name: 'Final Turn',
  description: 'Draw pile empty scenario',
  gameState: { phase: 'playing' },
};

