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

// Create a 4-card line (lot) - all same shape, same color, different numbers
grid.addCard(1, 0, new Card('Square', 2, 'Red'));
grid.addCard(2, 0, new Card('Square', 3, 'Red'));
grid.addCard(3, 0, new Card('Square', 4, 'Red'));

const gameState: GameState = {
  phase: 'playing',
  currentPlayerIndex: 0,
  turnPhase: 'cardPlacement',
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
      score: 10, // Score from the lot: (1+2+3+4) * 2 = 20, but showing partial
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
    enableWildcards: true,
    triggerFinalRound: false,
  },
};

export const lotCreation: UseCase = {
  name: 'Lot Creation',
  description:
    'A 4-card line (lot) - all same shape (Square), same color (Red), different numbers (1,2,3,4). Lots score double points.',
  gameState,
};
