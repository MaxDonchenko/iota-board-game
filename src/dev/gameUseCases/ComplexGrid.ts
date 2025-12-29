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

// Create horizontal line (all Red, same shape, different numbers)
grid.addCard(1, 0, new Card('Square', 2, 'Red'));
grid.addCard(2, 0, new Card('Square', 3, 'Red'));
grid.addCard(3, 0, new Card('Square', 4, 'Red'));

// Create vertical line from starter (all different colors, same number, different shapes)
grid.addCard(0, 1, new Card('Circle', 1, 'Blue'));
grid.addCard(0, 2, new Card('Triangle', 1, 'Green'));
grid.addCard(0, 3, new Card('Plus', 1, 'Yellow'));

// Create another horizontal line (all Blue, same shape, different numbers)
// Use Plus instead of Circle 3 to avoid conflict
grid.addCard(1, 2, new Card('Circle', 2, 'Blue'));
grid.addCard(2, 2, new Card('Plus', 3, 'Yellow'));

// Create another vertical line (all same number 3, different shapes, different colors)
// Vertical line at x=2: Square 3 Red (from horizontal), Triangle 3 Blue, Plus 3 Blue (from horizontal), Plus 3 Green
grid.addCard(2, 1, new Card('Triangle', 3, 'Blue'));
grid.addCard(2, 3, new Card('Circle', 3, 'Green'));

const gameState: GameState = {
  phase: 'playing',
  currentPlayerIndex: 0,
  turnPhase: 'cardPlacement',
  players: [
    {
      id: 'player-0',
      name: 'Player 1',
      hand: [
        new Card('Circle', 4, 'Red'),
        new Card('Triangle', 4, 'Red'),
        new Card('Plus', 2, 'Blue'),
        new Card('Square', 1, 'Blue'),
      ],
      score: 25,
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

export const complexGrid: UseCase = {
  name: 'Complex Grid',
  description:
    'Multiple intersecting lines: horizontal lines at y=0 (Red) and y=2 (Blue), vertical lines at x=0 (mixed colors), x=2 (all number 3), and x=3 (red-yellow-green-blue). Cards can be part of multiple lines.',
  gameState,
};
