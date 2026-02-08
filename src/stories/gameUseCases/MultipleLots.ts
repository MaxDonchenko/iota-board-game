import { Grid } from '@/game/Grid';
import { Deck } from '@/game/Deck';
import { Card } from '@/game/Card';
import type { UseCase } from './types';
import type { GameState } from '@/types/Game.types';

const grid = new Grid();
const deck = new Deck('full');

// Setup for two lots
// Lot 1: Horizontal (0,0) to (3,0) - Red Squares 1, 2, 3, 4
grid.setStarterCard(0, 0, new Card('Square', 1, 'Red'));
grid.addCard(1, 0, new Card('Square', 2, 'Red'));
grid.addCard(2, 0, new Card('Square', 3, 'Red'));
grid.addCard(3, 0, new Card('Square', 4, 'Red'));

// Lot 2: Vertical (0,-3) to (0,0) - Different Colors, Squares, all 1
grid.addCard(0, -1, new Card('Square', 1, 'Blue'));
grid.addCard(0, -2, new Card('Square', 1, 'Green'));
grid.addCard(0, -3, new Card('Square', 1, 'Yellow'));

// The card at (0,0) completes both lines.
// Line 1: Red Squares 1,2,3,4 (Sum: 10)
// Line 2: All Square 1, Different colors (Sum: 4)
// Total Base Score: 14
// 2 Lots: 14 * 2 * 2 = 56

const gameState: GameState = {
  phase: 'playing',
  currentPlayerIndex: 0,
  players: [
    {
      id: 'player-0',
      name: 'Player 1',
      hand: [
        new Card('Circle', 1, 'Blue'),
        new Card('Triangle', 2, 'Green'),
        new Card('Plus', 3, 'Yellow'),
        new Card('Square', 1, 'Blue'),
      ],
      score: 56,
    },
  ],
  grid,
  deck,
  isFinalTurn: false,
  gameMode: 'full',
  turnPhase: 'cardPlacement',
  settings: {
    theme: 'light',
    useGradients: true,
    gameMode: 'full',
    showInvalidPlacements: false,
    wildcardVariant: 'modern',
    cardVariant: 'modern',
  },
};

export const multipleLots: UseCase = {
  name: 'Multiple Lots',
  description:
    'Completing multiple lots in one turn doubles the score again for each lot. Base turn score 14, 2 lots completed -> 14 × 2 × 2 = 56.',
  gameState,
};
