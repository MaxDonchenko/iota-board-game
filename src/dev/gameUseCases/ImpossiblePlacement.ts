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

// Create a line that leaves gaps
grid.addCard(2, 0, new Card('Square', 3, 'Red')); // Gap at (1,0)
grid.addCard(0, 2, new Card('Circle', 1, 'Red')); // Gap at (0,1)

// The gaps at (1,0) and (0,1) cannot be filled because:
// - (1,0) would need to match both Square 1,3 Red (horizontal) and Circle 1 Red (vertical) - impossible
// - (0,1) would need to match both Square 1 Red (vertical) and Square 3 Red (horizontal) - impossible

const gameState: GameState = {
  phase: 'playing',
  currentPlayerIndex: 0,
  turnPhase: 'cardPlacement',
  players: [
    {
      id: 'player-0',
      name: 'Player 1',
      hand: [
        new Card('Square', 2, 'Red'), // This could fill (1,0) but conflicts with vertical line
        new Card('Circle', 2, 'Red'), // This could fill (0,1) but conflicts with horizontal line
        new Card('Triangle', 1, 'Blue'),
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

export const impossiblePlacement: UseCase = {
  name: 'Impossible Placement',
  description: 'Grid has gaps at (1,0) and (0,1) that cannot be filled. Any card placed there would violate line rules - it would need to match conflicting patterns in both horizontal and vertical lines.',
  gameState,
};

