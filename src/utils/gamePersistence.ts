import { Grid } from '@/game/Grid';
import { Deck } from '@/game/Deck';
import { Card } from '@/game/Card';
import type {
  GameState,
  GameSettings,
  GamePhase,
  TurnPhase,
  AIDifficulty,
  GameMode,
} from '@/types/Game.types';
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
  startTime?: string;
  lastMovePlacements?: Array<{ card: SerializableCard; position: { x: number; y: number } }>;
  lastMovePlayerIndex?: number | null;
}

interface SerializablePlayer {
  id: string;
  name: string;
  hand: SerializableCard[];
  score: number;
  isAI?: boolean;
  difficulty?: string;
  color: string;
}

interface SerializableCard {
  shape?: string;
  number?: number;
  color?: string;
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
    wildValue: card.wildValue
      ? {
          shape: card.wildValue.shape,
          number: card.wildValue.number,
          color: card.wildValue.color,
        }
      : undefined,
  };
}

function deserializeCard(serialized: SerializableCard): Card {
  const card = new Card(
    serialized.shape as Shape | undefined,
    serialized.number as Number | undefined,
    serialized.color as Color | undefined,
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
  const deck = new Deck(serialized.gameMode as GameMode);
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
    players: gameState.players.map((p) => ({
      id: p.id,
      name: p.name,
      hand: p.hand.map(serializeCard),
      score: p.score,
      isAI: p.isAI,
      difficulty: p.difficulty,
      color: p.color,
    })),
    grid: serializeGrid(gameState.grid),
    deck: serializeDeck(gameState.deck),
    isFinalTurn: gameState.isFinalTurn,
    gameMode: gameState.gameMode,
    settings: gameState.settings,
    startTime: gameState.startTime ? gameState.startTime.toISOString() : undefined,
    lastMovePlacements: gameState.lastMovePlacements?.map((p) => ({
      card: serializeCard(p.card),
      position: p.position,
    })),
    lastMovePlayerIndex: gameState.lastMovePlayerIndex,
  };
}

export function deserializeGameState(serialized: SerializableGameState): GameState {
  return {
    phase: serialized.phase as GamePhase,
    currentPlayerIndex: serialized.currentPlayerIndex,
    turnPhase: serialized.turnPhase as TurnPhase,
    players: serialized.players.map((p) => ({
      id: p.id,
      name: p.name,
      hand: p.hand.map(deserializeCard),
      score: p.score,
      isAI: p.isAI,
      difficulty: p.difficulty as AIDifficulty,
      color: p.color,
    })),
    grid: deserializeGrid(serialized.grid),
    deck: deserializeDeck(serialized.deck),
    isFinalTurn: serialized.isFinalTurn,
    gameMode: serialized.gameMode as GameMode,
    settings: serialized.settings,
    startTime: serialized.startTime ? new Date(serialized.startTime) : undefined,
    lastMovePlacements: serialized.lastMovePlacements?.map((p) => ({
      card: deserializeCard(p.card),
      position: p.position,
    })),
    lastMovePlayerIndex: serialized.lastMovePlayerIndex,
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
  const key = `iota-game-${gameId}`;
  const stored = localStorage.getItem(key);
  if (!stored) {
    console.warn(`[Persistence] No data found in localStorage for key: ${key}`);
    return null;
  }

  try {
    const serialized = JSON.parse(stored) as SerializableGameState;
    const state = deserializeGameState(serialized);
    console.log(`[Persistence] Successfully loaded and deserialized game: ${gameId}`);
    return state;
  } catch (e) {
    console.error(`[Persistence] Failed to parse or deserialize game: ${gameId}`, e);
    return null;
  }
}
