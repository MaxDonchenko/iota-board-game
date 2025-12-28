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

// Create horizontal line
grid.addCard(1, 0, new Card('Square', 2, 'Red'));
grid.addCard(2, 0, new Card('Square', 3, 'Red'));

// Create vertical line intersecting at (0, 0) - the starter card
// All different colors pattern: Red, Blue, Green
grid.addCard(0, 1, new Card('Circle', 1, 'Blue')); // Same number, different shape and color
grid.addCard(0, 2, new Card('Triangle', 1, 'Green')); // Same number, different shape and color

// The card at (0, 0) is part of both horizontal and vertical lines

const gameState: GameState = {
  phase: 'playing',
  currentPlayerIndex: 0,
  turnPhase: 'cardPlacement',
  players: [
    {
      id: 'player-0',
      name: 'Player 1',
      hand: [
        new Card('Plus', 1, 'Red'),
        new Card('Square', 4, 'Blue'),
        new Card('Circle', 2, 'Green'),
        new Card('Triangle', 3, 'Yellow'),
      ],
      score: 7, // Score from both lines: horizontal (1+2+3) + vertical (1+1+1) = 6+3 = 9, but showing partial
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
  },
};

export const multiLineScoring: UseCase = {
  name: 'Multi-Line Scoring',
  description: 'Card at (0,0) is part of both horizontal line (Square 1,2,3 Red) and vertical line (Square, Circle, Triangle - all 1, different colors: Red, Blue, Green). Cards in multiple lines score for each line.',
  gameState,
};

