import { Deck } from './Deck';
import { Grid } from './Grid';
import type { GameState, Player, GameSettings, GameMode, AIDifficulty } from '@/types/Game.types';

export class GameStateManager {
  static createInitialState(
    playerConfigs: { name: string; isAI?: boolean; difficulty?: AIDifficulty; color: string }[],
    gameMode: GameMode,
    settings: GameSettings
  ): GameState {
    const deck = new Deck(gameMode);
    const grid = new Grid();

    // Deal cards to players
    const players: Player[] = playerConfigs.map((config, index) => ({
      id: `player-${index}`,
      name: config.name,
      isAI: config.isAI,
      difficulty: config.difficulty,
      color: config.color,
      hand: deck.dealCards(4),
      score: 0,
    }));

    // Place starter card
    const starterCard = deck.drawCard();
    if (starterCard) {
      grid.setStarterCard(0, 0, starterCard);
    }

    return {
      phase: 'playing',
      currentPlayerIndex: 0,
      turnPhase: 'cardPlacement',
      players,
      grid,
      deck,
      isFinalTurn: false,
      gameMode,
      settings,
      startTime: new Date(),
    };
  }

  static updatePlayerScore(state: GameState, playerId: string, score: number): GameState {
    return {
      ...state,
      players: state.players.map((p) => (p.id === playerId ? { ...p, score: p.score + score } : p)),
    };
  }

  static nextTurn(state: GameState): GameState {
    const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
    return {
      ...state,
      currentPlayerIndex: nextPlayerIndex,
      turnPhase: 'cardPlacement',
    };
  }

  static refillHand(state: GameState, playerId: string): GameState {
    const player = state.players.find((p) => p.id === playerId);
    if (!player) {
      return state;
    }

    const cardsNeeded = 4 - player.hand.length;
    if (cardsNeeded > 0 && !state.deck.isEmpty()) {
      const newCards = state.deck.dealCards(cardsNeeded);
      return {
        ...state,
        players: state.players.map((p) =>
          p.id === playerId ? { ...p, hand: [...p.hand, ...newCards] } : p
        ),
      };
    }

    return state;
  }

  static checkGameEnd(state: GameState): boolean {
    return state.deck.isEmpty() && state.players.some((p) => p.hand.length === 0);
  }

  static setFinalTurn(state: GameState): GameState {
    return {
      ...state,
      isFinalTurn: true,
    };
  }
}
