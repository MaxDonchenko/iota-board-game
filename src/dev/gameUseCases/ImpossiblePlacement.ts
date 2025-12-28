import type { UseCase } from './types';

export const impossiblePlacement: UseCase = {
  name: 'Impossible Placement',
  description: 'Grid spaces that can\'t be filled',
  gameState: { phase: 'playing' },
};

