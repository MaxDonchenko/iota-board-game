import { describe, it, expect, beforeEach } from 'vitest';
import { GameStateManager } from '@/game/GameState';
import type { GameState } from '@/types/Game.types';

describe('Threefold Repetition', () => {
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

  describe('checkThreefoldRepetition', () => {
    it('should return false when no players have passed', () => {
      expect(GameStateManager.checkThreefoldRepetition(gameState)).toBe(false);
    });

    it('should return false when pass counts are less than 3', () => {
      gameState.players[0].passCount = 2;
      gameState.players[1].passCount = 1;
      expect(GameStateManager.checkThreefoldRepetition(gameState)).toBe(false);
    });

    it('should return true when all players have exactly 3 passes', () => {
      gameState.players[0].passCount = 3;
      gameState.players[1].passCount = 3;
      expect(GameStateManager.checkThreefoldRepetition(gameState)).toBe(true);
    });

    it('should return true when all players have more than 3 passes', () => {
      gameState.players[0].passCount = 4;
      gameState.players[1].passCount = 5;
      expect(GameStateManager.checkThreefoldRepetition(gameState)).toBe(true);
    });

    it('should return false when only one player has 3 passes', () => {
      gameState.players[0].passCount = 3;
      gameState.players[1].passCount = 2;
      expect(GameStateManager.checkThreefoldRepetition(gameState)).toBe(false);
    });

    it('should handle undefined passCount as 0', () => {
      gameState.players[0].passCount = undefined;
      gameState.players[1].passCount = 3;
      expect(GameStateManager.checkThreefoldRepetition(gameState)).toBe(false);
    });

    it('should work with multiple players', () => {
      gameState = GameStateManager.createInitialState(
        [
          { name: 'Player 1', color: 'red' },
          { name: 'Player 2', color: 'blue' },
          { name: 'Player 3', color: 'green' },
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
      gameState.players[0].passCount = 3;
      gameState.players[1].passCount = 3;
      gameState.players[2].passCount = 3;
      expect(GameStateManager.checkThreefoldRepetition(gameState)).toBe(true);
    });
  });

  describe('nextTurn with pass tracking', () => {
    it('should increment pass count when current turn is a pass', () => {
      gameState.turnPhase = 'pass';
      gameState.currentPlayerIndex = 0;
      gameState.players[0].passCount = 0;

      const newState = GameStateManager.nextTurn(gameState);

      expect(newState.players[0].passCount).toBe(1);
    });

    it('should reset pass counts when a non-pass move is made', () => {
      gameState.turnPhase = 'cardPlacement';
      gameState.currentPlayerIndex = 0;
      gameState.players[0].passCount = 2;
      gameState.players[1].passCount = 2;

      const newState = GameStateManager.nextTurn(gameState);

      expect(newState.players[0].passCount).toBe(0);
      expect(newState.players[1].passCount).toBe(0);
    });

    it('should transition to draw phase when threefold repetition is detected', () => {
      // Setup: both players have 2 passes each
      gameState.players[0].passCount = 2;
      gameState.players[1].passCount = 2;
      gameState.currentPlayerIndex = 0;
      gameState.turnPhase = 'pass';

      // Player 1 passes (gets 3rd pass)
      let newState = GameStateManager.nextTurn(gameState);
      expect(newState.players[0].passCount).toBe(3);
      expect(newState.phase).toBe('playing'); // Not draw yet - player 2 still has 2

      // Move to player 2
      newState.currentPlayerIndex = 1;
      newState.turnPhase = 'pass';

      // Player 2 passes (gets 3rd pass) - NOW it's a draw
      newState = GameStateManager.nextTurn(newState);
      expect(newState.phase).toBe('draw');
      expect(newState.players[1].passCount).toBe(3);
    });

    it('should move to next player after each turn', () => {
      gameState.currentPlayerIndex = 0;
      gameState.turnPhase = 'cardPlacement';

      let newState = GameStateManager.nextTurn(gameState);
      expect(newState.currentPlayerIndex).toBe(1);

      newState = GameStateManager.nextTurn(newState);
      expect(newState.currentPlayerIndex).toBe(0);
    });

    it('should wrap around to first player after last player', () => {
      gameState = GameStateManager.createInitialState(
        [
          { name: 'Player 1', color: 'red' },
          { name: 'Player 2', color: 'blue' },
          { name: 'Player 3', color: 'green' },
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
      gameState.currentPlayerIndex = 2;
      gameState.turnPhase = 'cardPlacement';

      const newState = GameStateManager.nextTurn(gameState);
      expect(newState.currentPlayerIndex).toBe(0);
    });

    it('should reset only non-pass movement passes to 0', () => {
      gameState.players[0].passCount = 2;
      gameState.players[1].passCount = 1;
      gameState.currentPlayerIndex = 0;
      gameState.turnPhase = 'cardPlacement';

      const newState = GameStateManager.nextTurn(gameState);

      expect(newState.players[0].passCount).toBe(0);
      expect(newState.players[1].passCount).toBe(0);
    });
  });

  describe('realistic threefold repetition scenario', () => {
    it('should reach draw state after simulating 3 consecutive passes per player', () => {
      gameState.turnPhase = 'pass';
      gameState.currentPlayerIndex = 0;
      gameState.players[0].passCount = 0;
      gameState.players[1].passCount = 0;

      // Round 1: Player 1 passes
      let state = GameStateManager.nextTurn(gameState);
      expect(state.players[0].passCount).toBe(1);
      expect(state.currentPlayerIndex).toBe(1);
      expect(state.phase).toBe('playing');

      // Round 1: Player 2 passes
      state.turnPhase = 'pass';
      state = GameStateManager.nextTurn(state);
      expect(state.players[1].passCount).toBe(1);
      expect(state.currentPlayerIndex).toBe(0);
      expect(state.phase).toBe('playing');

      // Round 2: Player 1 passes
      state.turnPhase = 'pass';
      state = GameStateManager.nextTurn(state);
      expect(state.players[0].passCount).toBe(2);
      expect(state.phase).toBe('playing');

      // Round 2: Player 2 passes
      state.turnPhase = 'pass';
      state = GameStateManager.nextTurn(state);
      expect(state.players[1].passCount).toBe(2);
      expect(state.phase).toBe('playing');

      // Round 3: Player 1 passes
      state.turnPhase = 'pass';
      state = GameStateManager.nextTurn(state);
      expect(state.players[0].passCount).toBe(3);
      expect(state.phase).toBe('playing');

      // Round 3: Player 2 passes - DRAW!
      state.turnPhase = 'pass';
      state = GameStateManager.nextTurn(state);
      expect(state.players[1].passCount).toBe(3);
      expect(state.phase).toBe('draw');
    });

    it('should reset pass counter if a player makes a move between passes', () => {
      // Player 1: 2 passes, Player 2: 2 passes
      gameState.turnPhase = 'pass';
      gameState.currentPlayerIndex = 0;
      gameState.players[0].passCount = 2;
      gameState.players[1].passCount = 2;

      // Player 1 passes (gets 3rd pass)
      let state = GameStateManager.nextTurn(gameState);
      expect(state.players[0].passCount).toBe(3);
      expect(state.currentPlayerIndex).toBe(1); // Now it's player 2's turn

      // Player 2 makes a move (cardPlacement) instead of passing - resets all passes
      state.turnPhase = 'cardPlacement';
      state = GameStateManager.nextTurn(state);

      expect(state.players[0].passCount).toBe(0);
      expect(state.players[1].passCount).toBe(0);
      expect(state.phase).toBe('playing');
    });
  });
});
