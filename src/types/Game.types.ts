import type { Card } from '@/game/Card';
import type { Grid } from '@/game/Grid';
import type { Deck } from '@/game/Deck';

export type GamePhase = 'setup' | 'playing' | 'ended';
export type TurnPhase = 'wildCardRecycle' | 'cardPlacement' | 'pass' | 'scoring';
export type GameMode = 'short' | 'full';

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  score: number;
}

export interface GameSettings {
  theme: 'light' | 'dark';
  useGradients: boolean;
  gameMode: GameMode;
  showInvalidPlacements: boolean;
  wildcardVariant: 'modern' | 'original';
  cardVariant: 'modern' | 'original';
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
}
