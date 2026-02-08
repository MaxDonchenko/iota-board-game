import { describe, it, expect, beforeEach } from 'vitest';
import { GameStateManager } from '@/game/GameState';
import { Card } from '@/game/Card';
import type { GameState, GameSettings } from '@/types/Game.types';

describe('GameStateManager - Final Round Logic', () => {
  let settings: GameSettings;
  let baseState: GameState;

  beforeEach(() => {
    settings = {
      theme: 'light',
      useGradients: true,
      gameMode: 'full',
      showInvalidPlacements: true,
      wildcardVariant: 'modern',
      cardVariant: 'modern',
      enableWildcards: true,
      triggerFinalRound: false, // Default off
    };

    const playerConfigs = [
      { name: 'Player 1', color: 'red' },
      { name: 'Player 2', color: 'blue' },
      { name: 'Player 3', color: 'green' },
    ];

    baseState = GameStateManager.createInitialState(playerConfigs, 'full', settings);

    // Empty the deck for game end scenarios
    baseState.deck.drawPile = [];
  });

  describe('triggerFinalRound: false (Standard Rules)', () => {
    it('should end immediately when ANY player finishes their cards', () => {
      // Player 1 (Index 0) finishes
      baseState.players[0].hand = [];
      baseState.currentPlayerIndex = 0;

      expect(GameStateManager.checkGameEnd(baseState)).toBe(true);
    });

    it('should end immediately when the last player finishes their cards', () => {
      // Player 3 (Index 2) finishes
      baseState.players[2].hand = [];
      baseState.currentPlayerIndex = 2;

      expect(GameStateManager.checkGameEnd(baseState)).toBe(true);
    });
  });

  describe('triggerFinalRound: true (Equalized Turns)', () => {
    beforeEach(() => {
      baseState.settings.triggerFinalRound = true;
    });

    it('should NOT end when the first player finishes their cards', () => {
      // Player 1 (Index 0) finishes
      baseState.players[0].hand = [];
      baseState.currentPlayerIndex = 0;

      expect(GameStateManager.checkGameEnd(baseState)).toBe(false);
    });

    it('should NOT end when the middle player finishes their cards', () => {
      // Player 2 (Index 1) finishes
      baseState.players[1].hand = [];
      baseState.currentPlayerIndex = 1;

      expect(GameStateManager.checkGameEnd(baseState)).toBe(false);
    });

    it('should end when the last player finishes their turn after someone else finished', () => {
      // Player 1 finished earlier in the round
      baseState.players[0].hand = [];

      // Now it is Player 3's (Index 2) turn ending
      baseState.currentPlayerIndex = 2;

      expect(GameStateManager.checkGameEnd(baseState)).toBe(true);
    });

    it('should end immediately if the LAST player is the one who finishes first', () => {
      // Players 1 and 2 still have cards
      baseState.players[0].hand = [new Card('Square', 1, 'Red')];
      baseState.players[1].hand = [new Card('Square', 2, 'Red')];

      // Player 3 (Index 2) finishes
      baseState.players[2].hand = [];
      baseState.currentPlayerIndex = 2;

      expect(GameStateManager.checkGameEnd(baseState)).toBe(true);
    });

    it('should correctly transition to isFinalRound in nextTurn', () => {
      // Player 1 finishes
      baseState.players[0].hand = [];
      baseState.currentPlayerIndex = 0;

      const nextState = GameStateManager.nextTurn(baseState);

      expect(nextState.isFinalRound).toBe(true);
      expect(nextState.currentPlayerIndex).toBe(1);
      expect(nextState.phase).toBe('playing'); // Still playing
    });
  });

  describe('User Scenario Verification', () => {
    it('covers the case: 2 players, P1 uses cards, deck empty, P2 finishes', () => {
      const p2Settings = { ...settings, triggerFinalRound: true };
      const state = GameStateManager.createInitialState(
        [
          { name: 'P1', color: 'red' },
          { name: 'P2', color: 'blue' },
        ],
        'full',
        p2Settings
      );

      state.deck.drawPile = [];

      // P1 takes turn, uses some cards but not all
      state.players[0].hand = [new Card('Square', 1, 'Red')];
      state.currentPlayerIndex = 0;
      expect(GameStateManager.checkGameEnd(state)).toBe(false);

      // P2 takes turn, finishes all cards
      state.players[1].hand = [];
      state.currentPlayerIndex = 1;
      expect(GameStateManager.checkGameEnd(state)).toBe(true);
    });
  });
});
