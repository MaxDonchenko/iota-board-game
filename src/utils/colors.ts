import type { Color } from '@/types/Card.types';

export type GameColor = Color;

const COLOR_HEX_MAP: Record<Color, string> = {
  Red: '#FF6B6B',
  Blue: '#4ECDC4',
  Green: '#95E1D3',
  Yellow: '#FFD700',
};

const COLOR_GRADIENT_MAP: Record<Color, string> = {
  Red: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)',
  Blue: 'linear-gradient(135deg, #4ECDC4 0%, #6EDDD6 100%)',
  Green: 'linear-gradient(135deg, #95E1D3 0%, #B5F0E3 100%)',
  Yellow: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', // Yolk-like
};

const COLOR_SOLID_MAP: Record<Color, string> = {
  Red: '#FF6B6B',
  Blue: '#4ECDC4',
  Green: '#95E1D3',
  Yellow: '#FFD700',
};

export class ColorUtils {
  static toHex(color: GameColor): string {
    return COLOR_HEX_MAP[color];
  }

  static validate(color: string): color is GameColor {
    return color in COLOR_HEX_MAP;
  }

  static getGradient(color: GameColor, useGradient: boolean): string {
    if (useGradient) {
      return COLOR_GRADIENT_MAP[color];
    }
    return COLOR_SOLID_MAP[color];
  }

  static getSolidColor(color: GameColor): string {
    return COLOR_SOLID_MAP[color];
  }
}

