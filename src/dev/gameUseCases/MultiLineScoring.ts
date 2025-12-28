import type { UseCase } from './types';

export const multiLineScoring: UseCase = {
  name: 'Multi-Line Scoring',
  description: 'Card in two lines scoring',
  gameState: { phase: 'playing' },
};

