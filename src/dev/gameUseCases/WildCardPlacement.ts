import type { UseCase } from './types';

export const wildCardPlacement: UseCase = {
  name: 'Wild Card Placement',
  description: 'Placing wild card in valid line',
  gameState: { phase: 'playing' },
};

