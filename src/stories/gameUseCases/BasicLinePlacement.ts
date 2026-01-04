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

// Place one card next to starter (forming a 2-card line)
grid.addCard(1, 0, new Card('Square', 2, 'Red'));

const gameState: GameState = {
  phase: 'playing',
  currentPlayerIndex: 0,
  turnPhase: 'cardPlacement',
  players: [
    {
      id: 'player-0',
      name: 'Player 1',
      hand: [
        new Card('Square', 3, 'Red'),
        new Card('Circle', 1, 'Blue'),
        new Card('Triangle', 2, 'Green'),
        new Card('Plus', 4, 'Yellow'),
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

export const basicLinePlacement: UseCase = {
  name: 'Basic Line Placement',
  description:
    'Simple 2-card line: starter card and one adjacent card (both same shape, same color, different numbers)',
  gameState,
};
