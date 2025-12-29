import { Grid } from '@/game/Grid';
import { Deck } from '@/game/Deck';
import { Card } from '@/game/Card';
import type { UseCase } from './types';
import type { GameState } from '@/types/Game.types';

const grid = new Grid();
const deck = new Deck('full');

// Place starter card
const starterCard = new Card('Square', 1, 'Red');
grid.setStarterCard(0, 0, starterCard);

// Create a horizontal line with all same number (1-1-1 pattern)
grid.addCard(1, 0, new Card('Circle', 1, 'Blue')); // Same number, different shape and color
grid.addCard(2, 0, new Card('Triangle', 1, 'Green')); // Same number, different shape and color

// Create a vertical line with sequential numbers (1-2-3 pattern)
grid.addCard(0, 1, new Card('Square', 2, 'Red')); // Sequential number
grid.addCard(0, 2, new Card('Square', 3, 'Red')); // Sequential number

// Edge case: Line with mixed patterns that would be invalid
// (This demonstrates what NOT to do - the grid shows valid placements)

const gameState: GameState = {
  phase: 'playing',
  currentPlayerIndex: 0,
  turnPhase: 'cardPlacement',
  players: [
    {
      id: 'player-0',
      name: 'Player 1',
      hand: [
        new Card('Plus', 4, 'Yellow'), // Could continue the "all different" horizontal line
        new Card('Square', 1, 'Red'), // Could continue the "all same" vertical line
        new Card('Circle', 1, 'Red'), // Edge case: same number/color, different shape
        new Card('Square', 2, 'Red'), // Edge case: same shape/color, different number
      ],
      score: 0,
    },
  ],
  grid,
  deck,
  isFinalTurn: false,
  gameMode: 'full',
  settings: {
    theme: 'light',
    useGradients: true,
    gameMode: 'full',
    showInvalidPlacements: false,
    wildcardVariant: 'modern',
    cardVariant: 'modern',
  },
};

export const edgeCaseValidation: UseCase = {
  name: 'Edge Case Validation',
  description: 'Various edge cases: horizontal line uses "all same number" pattern (1-1-1), vertical line uses sequential numbers (1-2-3). Demonstrates different valid line patterns.',
  gameState,
};

