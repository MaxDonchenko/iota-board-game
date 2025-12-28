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

// Empty the deck to simulate final turn
while (deck.drawPile.length > 0) {
  deck.drawCard();
}

const gameState: GameState = {
  phase: 'playing',
  currentPlayerIndex: 0,
  turnPhase: 'cardPlacement',
  players: [
    {
      id: 'player-0',
      name: 'Player 1',
      hand: [
        new Card('Square', 4, 'Red'),
        new Card('Circle', 1, 'Blue'),
      ],
      score: 0,
    },
    {
      id: 'player-1',
      name: 'Player 2',
      hand: [],
      score: 5,
    },
  ],
  grid,
  deck,
  isFinalTurn: true, // Final turn - deck is empty
  gameMode: 'full',
  settings: {
    theme: 'light',
    useGradients: true,
    gameMode: 'full',
  },
};

export const finalTurn: UseCase = {
  name: 'Final Turn',
  description: 'Draw pile is empty. This is the final turn - all scores are doubled. Player 2 has no cards left.',
  gameState,
};

