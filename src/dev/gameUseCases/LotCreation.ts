import type { UseCase } from './types';

export const lotCreation: UseCase = {
  name: 'Lot Creation',
  description: 'Creating a 4-card line (lot)',
  gameState: {
    // Placeholder - will be populated with actual GameState
    phase: 'playing',
  },
};

