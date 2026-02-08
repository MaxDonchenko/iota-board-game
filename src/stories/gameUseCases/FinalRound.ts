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

// Place some cards
grid.addCard(1, 0, new Card('Square', 2, 'Red'));
grid.addCard(2, 0, new Card('Square', 3, 'Red'));

// Empty the deck to simulate final round transition
while (deck.drawPile.length > 0) {
  deck.drawCard();
}

const gameState: GameState = {
  phase: 'playing',
  currentPlayerIndex: 1, // Player 2's turn
  turnPhase: 'cardPlacement',
  players: [
    {
      id: 'player-0',
      name: 'Player 1',
      hand: [], // Player 1 finished their hand
      score: 120,
      color: '#FF4B2B',
    },
    {
      id: 'player-1',
      name: 'Player 2',
      hand: [new Card('Circle', 1, 'Blue'), new Card('Circle', 2, 'Blue')],
      score: 100,
      color: '#2B95FF',
    },
    {
      id: 'player-2',
      name: 'Player 3',
      hand: [new Card('Triangle', 1, 'Green')],
      score: 80,
      color: '#61BB46',
    },
  ],
  grid,
  deck,
  isFinalTurn: false,
  isFinalRound: true, // Marked as final round
  gameMode: 'full',
  settings: {
    theme: 'light',
    useGradients: true,
    gameMode: 'full',
    showInvalidPlacements: true,
    wildcardVariant: 'modern',
    cardVariant: 'modern',
    enableWildcards: true,
    triggerFinalRound: true,
  },
};

export const finalRound: UseCase = {
  name: 'Final Round (Equal Turns)',
  description:
    'Player 1 has finished their hand, but because "Equalize Turns" is enabled, other players continue their turns until the round is complete.',
  gameState,
};
