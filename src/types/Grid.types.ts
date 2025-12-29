import type { Card } from '@/game/Card';

export type Direction = 'horizontal' | 'vertical';

export interface Coordinate {
  x: number;
  y: number;
}

export type GridPosition = Map<string, Card>; // key: "x,y"

export interface Line {
  cards: Card[];
  positions: Coordinate[];
  direction: Direction;
}
