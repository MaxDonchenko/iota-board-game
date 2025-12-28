import { Grid } from '@/game/Grid';
import { Deck } from '@/game/Deck';
import { Card } from '@/game/Card';
import type { GameState, GameSettings } from '@/types/Game.types';
import type { Shape, Number, Color } from '@/types/Card.types';

export interface SerializableGameState {
  id: string;
  phase: string;
  currentPlayerIndex: number;
  turnPhase: string;
  players: SerializablePlayer[];
  grid: SerializableGrid;
  deck: SerializableDeck;
  isFinalTurn: boolean;
  gameMode: string;
  settings: GameSettings;
}

interface SerializablePlayer {
  id: string;
  name: string;
  hand: SerializableCard[];
  score: number;
}

interface SerializableCard {
  shape: string;
  number: number;
  color: string;
  isWild: boolean;
  wildValue?: {
    shape: string;
    number: number;
    color: string;
  };
}

interface SerializableGrid {
  positions: Array<{ x: number; y: number; card: SerializableCard }>;
  starterCard?: SerializableCard;
  starterPosition?: { x: number; y: number };
}

interface SerializableDeck {
  drawPile: SerializableCard[];
  discardPile: SerializableCard[];
  gameMode: string;
}

function serializeCard(card: Card): SerializableCard {
  return {
    shape: card.shape,
    number: card.number,
    color: card.color,
    isWild: card.isWild,
    wildValue: card.wildValue ? {
      shape: card.wildValue.shape,
      number: card.wildValue.number,
      color: card.wildValue.color,
    } : undefined,
  };
}

function deserializeCard(serialized: SerializableCard): Card {
  const card = new Card(
    serialized.shape as Shape,
    serialized.number as Number,
    serialized.color as Color,
    serialized.isWild
  );
  if (serialized.wildValue) {
    card.wildValue = {
      shape: serialized.wildValue.shape as Shape,
      number: serialized.wildValue.number as Number,
      color: serialized.wildValue.color as Color,
    };
  }
  return card;
}

function serializeGrid(grid: Grid): SerializableGrid {
  const positions: Array<{ x: number; y: number; card: SerializableCard }> = [];
  for (const [key, card] of grid.positions.entries()) {
    const [x, y] = key.split(',').map(Number);
    positions.push({ x, y, card: serializeCard(card) });
  }
  
  return {
    positions,
    starterCard: grid.starterCard ? serializeCard(grid.starterCard) : undefined,
    starterPosition: grid.starterPosition,
  };
}

function deserializeGrid(serialized: SerializableGrid): Grid {
  const grid = new Grid();
  for (const { x, y, card } of serialized.positions) {
    grid.addCard(x, y, deserializeCard(card));
  }
  if (serialized.starterCard && serialized.starterPosition) {
    grid.starterCard = deserializeCard(serialized.starterCard);
    grid.starterPosition = serialized.starterPosition;
  }
  return grid;
}

function serializeDeck(deck: Deck): SerializableDeck {
  return {
    drawPile: deck.drawPile.map(serializeCard),
    discardPile: deck.discardPile.map(serializeCard),
    gameMode: deck.gameMode,
  };
}

function deserializeDeck(serialized: SerializableDeck): Deck {
  const deck = new Deck(serialized.gameMode as 'short' | 'full');
  deck.drawPile = serialized.drawPile.map(deserializeCard);
  deck.discardPile = serialized.discardPile.map(deserializeCard);
  return deck;
}

export function serializeGameState(gameState: GameState, gameId: string): SerializableGameState {
  return {
    id: gameId,
    phase: gameState.phase,
    currentPlayerIndex: gameState.currentPlayerIndex,
    turnPhase: gameState.turnPhase,
    players: gameState.players.map(p => ({
      id: p.id,
      name: p.name,
      hand: p.hand.map(serializeCard),
      score: p.score,
    })),
    grid: serializeGrid(gameState.grid),
    deck: serializeDeck(gameState.deck),
    isFinalTurn: gameState.isFinalTurn,
    gameMode: gameState.gameMode,
    settings: gameState.settings,
  };
}

export function deserializeGameState(serialized: SerializableGameState): GameState {
  return {
    phase: serialized.phase as any,
    currentPlayerIndex: serialized.currentPlayerIndex,
    turnPhase: serialized.turnPhase as any,
    players: serialized.players.map(p => ({
      id: p.id,
      name: p.name,
      hand: p.hand.map(deserializeCard),
      score: p.score,
    })),
    grid: deserializeGrid(serialized.grid),
    deck: deserializeDeck(serialized.deck),
    isFinalTurn: serialized.isFinalTurn,
    gameMode: serialized.gameMode as 'short' | 'full',
    settings: serialized.settings,
  };
}

export function generateGameId(): string {
  return `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function saveGameToStorage(gameState: GameState, gameId: string): void {
  const serialized = serializeGameState(gameState, gameId);
  localStorage.setItem(`iota-game-${gameId}`, JSON.stringify(serialized));
}

export function loadGameFromStorage(gameId: string): GameState | null {
  const stored = localStorage.getItem(`iota-game-${gameId}`);
  if (!stored) {
    return null;
  }
  
  try {
    const serialized = JSON.parse(stored) as SerializableGameState;
    return deserializeGameState(serialized);
  } catch {
    return null;
  }
}

