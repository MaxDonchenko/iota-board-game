import { Deck } from './Deck';
import { Grid } from './Grid';
import { Card } from './Card';
import { Validation } from './Validation';
import type { GameState, Player, GameSettings, GameMode, AIDifficulty } from '@/types/Game.types';

export class GameStateManager {
  static createInitialState(
    playerConfigs: { name: string; isAI?: boolean; difficulty?: AIDifficulty; color: string }[],
    gameMode: GameMode,
    settings: GameSettings
  ): GameState {
    const deck = new Deck(gameMode, settings.enableWildcards);
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

    // Place starter card (must not be a wildcard)
    let starterCard = deck.drawCard();
    const tempPiles: Card[] = [];

    while (starterCard && starterCard.isWild) {
      tempPiles.push(starterCard);
      starterCard = deck.drawCard();
    }

    if (starterCard) {
      grid.setStarterCard(0, 0, starterCard);
    }

    // Put wildcards back and reshuffle or just put them back (shuffling is better)
    tempPiles.forEach((card) => deck.addToDrawPile(card));
    if (tempPiles.length > 0) {
      deck.shuffle();
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

  static checkThreefoldRepetition(state: GameState): boolean {
    const passCounts = state.players.map((player) => player.passCount || 0);
    return passCounts.every((count) => count >= 3);
  }

  static canMakeAnyMove(state: GameState, playerIndex: number): boolean {
    const player = state.players[playerIndex];
    if (!player) return false;

    // Check if player can place any card
    // First, find the bounds of existing positions with a buffer
    let minX = 0;
    let maxX = 0;
    let minY = 0;
    let maxY = 0;

    if (state.grid.positions.size > 0) {
      for (const [key] of state.grid.positions.entries()) {
        const [x, y] = key.split(',').map(Number);
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }

    // Add buffer of ±2 around the extrema
    const buffer = 2;
    const xMin = minX - buffer;
    const xMax = maxX + buffer;
    const yMin = minY - buffer;
    const yMax = maxY + buffer;

    for (const card of player.hand) {
      // Check all possible positions around the grid
      for (let x = xMin; x <= xMax; x++) {
        for (let y = yMin; y <= yMax; y++) {
          const validation = Validation.validatePlacement(
            [{ card, position: { x, y } }],
            state.grid
          );
          if (validation.isValid) {
            return true; // Found a valid placement
          }
        }
      }
    }

    // Check if player can exchange cards (deck must not be empty)
    if (!state.deck.isEmpty()) {
      return true;
    }

    // Check if player can recycle a wildcard
    if (state.grid.positions.size > 0) {
      for (const [, gridCard] of state.grid.positions.entries()) {
        if (gridCard && gridCard.isWild && gridCard.wildValue) {
          // Player can potentially recycle this wildcard if they have a matching real card
          for (const handCard of player.hand) {
            if (
              !handCard.isWild &&
              handCard.shape === gridCard.wildValue.shape &&
              handCard.number === gridCard.wildValue.number &&
              handCard.color === gridCard.wildValue.color
            ) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }

  static nextTurn(state: GameState): GameState {
    const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;

    // If the current turn was a pass, increment that player's pass count.
    // Otherwise reset all players' pass counts because a non-pass action broke the consecutive-pass sequence.
    const updatedPlayers = state.players.map((player, index) => {
      if (state.turnPhase === 'pass') {
        if (index === state.currentPlayerIndex) {
          return { ...player, passCount: (player.passCount || 0) + 1 };
        }
        return player;
      }

      // Non-pass action -> reset any existing pass counters
      if (player.passCount && player.passCount !== 0) {
        return { ...player, passCount: 0 };
      }
      return player;
    });

    // Check if any player can make a move
    const anyPlayerCanMove = updatedPlayers.some((_, index) =>
      this.canMakeAnyMove({ ...state, players: updatedPlayers }, index)
    );

    if (!anyPlayerCanMove) {
      return {
        ...state,
        phase: 'draw',
        players: updatedPlayers,
        drawReason: 'no-valid-moves',
      };
    }

    // Check for threefold repetition
    if (this.checkThreefoldRepetition({ ...state, players: updatedPlayers })) {
      return {
        ...state,
        phase: 'draw',
        players: updatedPlayers,
        drawReason: 'threefold-repetition',
      };
    }

    return {
      ...state,
      currentPlayerIndex: nextPlayerIndex,
      turnPhase: 'cardPlacement',
      players: updatedPlayers,
      isFinalRound:
        state.isFinalRound ||
        (state.deck.isEmpty() && updatedPlayers.some((p) => p.hand.length === 0)),
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
    const deckEmpty = state.deck.isEmpty();
    const anyoneFinished = state.players.some((p) => p.hand.length === 0);

    if (!deckEmpty || !anyoneFinished) return false;

    if (state.settings.triggerFinalRound) {
      // If triggerFinalRound is enabled, the game continues until the last player in the rotation finishes their turn
      return state.currentPlayerIndex === state.players.length - 1;
    }

    return true;
  }

  static setFinalTurn(state: GameState): GameState {
    return {
      ...state,
      isFinalTurn: true,
    };
  }
}
