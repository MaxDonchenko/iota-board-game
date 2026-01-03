import { describe, it, expect, beforeEach } from 'vitest';
import { GameStateManager } from '@/game/GameState';
import { Card as CardClass } from '@/game/Card';
import type { GameState } from '@/types/Game.types';

describe('No Valid Moves - Auto Draw', () => {
  let gameState: GameState;

  beforeEach(() => {
    gameState = GameStateManager.createInitialState(
      [
        { name: 'Player 1', color: 'red' },
        { name: 'Player 2', color: 'blue' },
      ],
      'full',
      {
        theme: 'light',
        useGradients: false,
        gameMode: 'full',
        showInvalidPlacements: false,
        wildcardVariant: 'modern',
        cardVariant: 'modern',
        enableWildcards: true,
      }
    );
  });

  describe('canMakeAnyMove', () => {
    it('should return true when player can place a card', () => {
      expect(GameStateManager.canMakeAnyMove(gameState, 0)).toBe(true);
    });

    it('should return true when player can exchange cards from deck', () => {
      gameState.players[0].hand = [new CardClass('Circle', 4, 'Yellow')];
      expect(GameStateManager.canMakeAnyMove(gameState, 0)).toBe(true);
    });

    it('should return false when deck is empty and hand has only invalid cards', () => {
      // Empty the deck
      gameState.deck.drawPile = [];

      // Clear the grid and remove starter card so there's no space to place
      gameState.grid.positions.clear();

      // Fill a 5x5 area completely so player can't place anything
      for (let x = -2; x <= 2; x++) {
        for (let y = -2; y <= 2; y++) {
          gameState.grid.positions.set(`${x},${y}`, new CardClass('Square', 2, 'Red'));
        }
      }

      // Give player a card that doesn't fit anywhere
      gameState.players[0].hand = [new CardClass('Circle', 4, 'Yellow')];

      expect(GameStateManager.canMakeAnyMove(gameState, 0)).toBe(false);
    });

    it('should return true when player can recycle a wildcard with matching card', () => {
      // Empty the deck
      gameState.deck.drawPile = [];

      // Place a wildcard on the board
      const wildcard = new CardClass('Square', 1, 'Red', true);
      wildcard.wildValue = { shape: 'Square', number: 2, color: 'Red' };
      gameState.grid.positions.set('0,1', wildcard);

      // Give player the matching real card
      gameState.players[0].hand = [new CardClass('Square', 2, 'Red')];

      expect(GameStateManager.canMakeAnyMove(gameState, 0)).toBe(true);
    });

    it('should return false when no wildcards on board to recycle', () => {
      // Empty the deck
      gameState.deck.drawPile = [];

      // Clear grid and fill it with non-wildcard cards
      gameState.grid.positions.clear();
      for (let x = -2; x <= 2; x++) {
        for (let y = -2; y <= 2; y++) {
          gameState.grid.positions.set(`${x},${y}`, new CardClass('Square', 2, 'Red'));
        }
      }

      // Give player cards that don't match anything
      gameState.players[0].hand = [new CardClass('Circle', 4, 'Yellow')];

      expect(GameStateManager.canMakeAnyMove(gameState, 0)).toBe(false);
    });

    it('should return false when wildcard has no matching card in hand', () => {
      // Empty the deck
      gameState.deck.drawPile = [];

      // Clear grid and fill it so wildcard is the only option
      gameState.grid.positions.clear();
      for (let x = -2; x <= 2; x++) {
        for (let y = -2; y <= 2; y++) {
          if (x === 0 && y === 0) {
            // Place a wildcard with a specific value
            const wildcard = new CardClass('Square', 1, 'Red', true);
            wildcard.wildValue = { shape: 'Square', number: 2, color: 'Red' };
            gameState.grid.positions.set(`${x},${y}`, wildcard);
          } else {
            gameState.grid.positions.set(`${x},${y}`, new CardClass('Square', 3, 'Red'));
          }
        }
      }

      // Give player a card that doesn't match the wildcard
      gameState.players[0].hand = [new CardClass('Circle', 3, 'Blue')];

      expect(GameStateManager.canMakeAnyMove(gameState, 0)).toBe(false);
    });
  });

  describe('nextTurn with no valid moves check', () => {
    it('should transition to draw when all players have no valid moves', () => {
      // Empty the deck
      gameState.deck.drawPile = [];

      // Fill grid so no player can place
      gameState.grid.positions.clear();
      for (let x = -2; x <= 2; x++) {
        for (let y = -2; y <= 2; y++) {
          gameState.grid.positions.set(`${x},${y}`, new CardClass('Square', 2, 'Red'));
        }
      }

      // Both players have no valid moves
      gameState.players[0].hand = [new CardClass('Circle', 4, 'Yellow')];
      gameState.players[1].hand = [new CardClass('Circle', 4, 'Yellow')];

      // Current player passes
      gameState.turnPhase = 'pass';
      gameState.currentPlayerIndex = 0;

      const newState = GameStateManager.nextTurn(gameState);

      expect(newState.phase).toBe('draw');
      expect(newState.drawReason).toBe('no-valid-moves');
    });

    it('should set drawReason to threefold-repetition when all players have 3 passes', () => {
      gameState.players[0].passCount = 3;
      gameState.players[1].passCount = 3;
      gameState.currentPlayerIndex = 0;
      gameState.turnPhase = 'pass';

      const newState = GameStateManager.nextTurn(gameState);

      expect(newState.phase).toBe('draw');
      expect(newState.drawReason).toBe('threefold-repetition');
    });

    it('should check no-valid-moves before threefold-repetition', () => {
      // Both conditions are true
      gameState.players[0].passCount = 3;
      gameState.players[1].passCount = 3;
      gameState.deck.drawPile = [];

      // Fill grid so player 2 can't place
      gameState.grid.positions.clear();
      for (let x = -2; x <= 2; x++) {
        for (let y = -2; y <= 2; y++) {
          gameState.grid.positions.set(`${x},${y}`, new CardClass('Square', 2, 'Red'));
        }
      }

      gameState.players[1].hand = [new CardClass('Circle', 4, 'Yellow')];

      gameState.currentPlayerIndex = 0;
      gameState.turnPhase = 'pass';

      const newState = GameStateManager.nextTurn(gameState);

      // Should prefer no-valid-moves
      expect(newState.drawReason).toBe('no-valid-moves');
    });

    it('should continue game when at least one player can make a move', () => {
      gameState.deck.drawPile = [];
      gameState.currentPlayerIndex = 0;
      gameState.turnPhase = 'pass';

      // Player 1 can't move, but Player 2 can still place next to starter
      gameState.players[0].hand = [new CardClass('Circle', 4, 'Yellow')]; // no valid moves
      gameState.players[1].hand = [new CardClass('Square', 1, 'Red')]; // can place next to starter

      const newState = GameStateManager.nextTurn(gameState);

      expect(newState.phase).toBe('playing');
      expect(newState.currentPlayerIndex).toBe(1);
    });
  });

  describe('stuck player scenarios', () => {
    it('should detect when player is stuck with impossible hand', () => {
      // Setup: Empty deck, filled board with no valid placements, no wildcards
      gameState.deck.drawPile = [];

      // Fill grid with a pattern that blocks everything
      for (let x = -2; x <= 2; x++) {
        for (let y = -2; y <= 2; y++) {
          if (x === 0 && y === 0) continue;
          gameState.grid.positions.set(`${x},${y}`, new CardClass('Square', 2, 'Red'));
        }
      }

      // Give player a card that doesn't fit
      gameState.players[0].hand = [new CardClass('Circle', 4, 'Yellow')];

      expect(GameStateManager.canMakeAnyMove(gameState, 0)).toBe(false);
    });

    it('should transition to draw when all players are stuck', () => {
      // Setup the stuck scenario
      gameState.deck.drawPile = [];

      // Fill grid
      for (let x = -2; x <= 2; x++) {
        for (let y = -2; y <= 2; y++) {
          if (x === 0 && y === 0) continue;
          gameState.grid.positions.set(`${x},${y}`, new CardClass('Square', 2, 'Red'));
        }
      }

      // Both players stuck
      gameState.players[0].hand = [new CardClass('Circle', 4, 'Yellow')];
      gameState.players[1].hand = [new CardClass('Circle', 4, 'Yellow')];

      gameState.currentPlayerIndex = 0;
      gameState.turnPhase = 'pass';

      const newState = GameStateManager.nextTurn(gameState);

      expect(newState.phase).toBe('draw');
      expect(newState.drawReason).toBe('no-valid-moves');
    });
  });
});
