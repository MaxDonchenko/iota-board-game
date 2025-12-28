import type { Shape, Number, Color } from '@/types/Card.types';
import type { GameMode } from '@/types/Game.types';

export const MAX_LINE_LENGTH = 4 as const;
export const HAND_SIZE = 4 as const;
export const MIN_LINE_LENGTH = 2 as const;
export const DECK_SIZE_FULL = 64 as const;
export const DECK_SIZE_SHORT = 32 as const;
export const WILD_CARD_COUNT_FULL = 2 as const;
export const WILD_CARD_COUNT_SHORT = 1 as const;

export const SHAPES: readonly Shape[] = ['Square', 'Triangle', 'Circle', 'Plus'] as const;
export const NUMBERS: readonly Number[] = [1, 2, 3, 4] as const;
export const COLORS: readonly Color[] = ['Red', 'Blue', 'Green', 'Yellow'] as const;

export const GAME_MODES = {
  SHORT: 'short' as const,
  FULL: 'full' as const,
} as const;

export const DECK_SIZES = {
  SHORT: 32,
  FULL: 64,
} as const;

export const WILD_CARD_COUNTS = {
  SHORT: 1,
  FULL: 2,
} as const;

export const LOT_MULTIPLIER = 2 as const;
export const ALL_FOUR_MULTIPLIER = 2 as const;
export const FINAL_TURN_MULTIPLIER = 2 as const;

