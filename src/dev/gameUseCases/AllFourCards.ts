import { Grid } from '@/game/Grid';
import { Deck } from '@/game/Deck';
import { Card } from '@/game/Card';
import type { UseCase } from './types';
import type { GameState } from '@/types/Game.types';

// Create a game state demonstrating playing all 4 cards
const grid = new Grid();
const deck = new Deck('full');

// Place starter card
const starterCard = new Card('Square', 1, 'Red');
grid.setStarterCard(0, 0, starterCard);

// Create a scenario where player has 4 cards ready to play
// Player's hand would have 4 cards that can form a valid line
const player1Hand = [
  new Card('Square', 2, 'Red'),
  new Card('Square', 3, 'Red'),
  new Card('Square', 4, 'Red'),
  new Card('Circle', 1, 'Red'), // Different shape but same color/number pattern
];

const gameState: GameState = {
  phase: 'playing',
  currentPlayerIndex: 0,
  turnPhase: 'cardPlacement',
  players: [
    {
      id: 'player-0',
      name: 'Player 1',
      hand: player1Hand,
      score: 0,
    },
    {
      id: 'player-1',
      name: 'Player 2',
      hand: [],
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
  },
};

export const allFourCards: UseCase = {
  name: 'All Four Cards',
  description: 'Player has 4 cards ready to play in one turn (all 4 cards bonus applies)',
  gameState,
};

