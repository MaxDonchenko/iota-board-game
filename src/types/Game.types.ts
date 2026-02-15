import type { Card } from '@/game/Card';
import type { Grid } from '@/game/Grid';
import type { Deck } from '@/game/Deck';
import type { Coordinate } from './Grid.types';

export type GamePhase = 'setup' | 'playing' | 'ended';
export type TurnPhase = 'wildCardRecycle' | 'cardPlacement' | 'pass' | 'scoring';
export type GameMode = 'ultra-short' | 'short' | 'full';
export type AIDifficulty = 'easy' | 'medium' | 'hard';
export type DrawReason = 'threefold-repetition' | 'no-valid-moves';

export interface PlayerConfig {
  name: string;
  isAI?: boolean;
  difficulty?: AIDifficulty;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  score: number;
  isAI?: boolean;
  difficulty?: AIDifficulty;
  color: string;
  passCount?: number;
}

export interface GameSettings {
  theme: 'light' | 'dark';
  useGradients: boolean;
  gameMode: GameMode;
  showInvalidPlacements: boolean;
  wildcardVariant: 'modern' | 'original';
  cardVariant: 'modern' | 'original';
  enableWildcards: boolean;
  triggerFinalRound: boolean;
}

export interface GameState {
  phase: GamePhase;
  currentPlayerIndex: number;
  turnPhase: TurnPhase;
  players: Player[];
  grid: Grid;
  deck: Deck;
  isFinalTurn: boolean;
  gameMode: GameMode;
  settings: GameSettings;
  startTime?: Date;
  lastMovePlacements?: { card: Card; position: Coordinate }[];
  lastMovePlayerIndex?: number | null;
  drawReason?: DrawReason;
  isFinalRound?: boolean;
}
