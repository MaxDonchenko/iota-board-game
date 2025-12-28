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

// Place regular cards
grid.addCard(1, 0, new Card('Square', 2, 'Red'));
grid.addCard(2, 0, new Card('Square', 3, 'Red'));

// Place wild card that can be replaced
const wildCard = new Card('Square', 1, 'Red', true);
wildCard.setWildValue({ shape: 'Square', number: 4, color: 'Red' });
grid.addCard(3, 0, wildCard);

const gameState: GameState = {
  phase: 'playing',
  currentPlayerIndex: 0,
  turnPhase: 'wildCardRecycle',
  players: [
    {
      id: 'player-0',
      name: 'Player 1',
      hand: [
        new Card('Square', 4, 'Red'), // This card can replace the wild card
        new Card('Circle', 1, 'Blue'),
        new Card('Triangle', 2, 'Green'),
        new Card('Plus', 3, 'Yellow'),
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

export const wildCardRecycling: UseCase = {
  name: 'Wild Card Recycling',
  description: 'Wild card on grid can be replaced with matching card from hand. Player has Square, 4, Red which matches the wild card\'s value.',
  gameState,
};

