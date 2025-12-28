import type { Color } from '@/types/Card.types';

export type GameColor = Color;

// Light mode colors (darker, for white text)
const COLOR_HEX_MAP_LIGHT: Record<Color, string> = {
  Red: '#CC3333',
  Blue: '#2E8B87',
  Green: '#5FAE9E',
  Yellow: '#CC9900',
};

const COLOR_GRADIENT_MAP_LIGHT: Record<Color, string> = {
  Red: 'linear-gradient(135deg, #CC3333 0%, #E64A4A 100%)',
  Blue: 'linear-gradient(135deg, #2E8B87 0%, #3FAFA9 100%)',
  Green: 'linear-gradient(135deg, #5FAE9E 0%, #7FC8B8 100%)',
  Yellow: 'linear-gradient(135deg, #CC9900 0%, #E6B800 100%)',
};

const COLOR_SOLID_MAP_LIGHT: Record<Color, string> = {
  Red: '#CC3333',
  Blue: '#2E8B87',
  Green: '#5FAE9E',
  Yellow: '#CC9900',
};

// Dark mode colors (lighter, for black text)
const COLOR_HEX_MAP_DARK: Record<Color, string> = {
  Red: '#FF9999',
  Blue: '#7EDDD6',
  Green: '#B5F0E3',
  Yellow: '#FFE066',
};

const COLOR_GRADIENT_MAP_DARK: Record<Color, string> = {
  Red: 'linear-gradient(135deg, #FF9999 0%, #FFB3B3 100%)',
  Blue: 'linear-gradient(135deg, #7EDDD6 0%, #9EEFE8 100%)',
  Green: 'linear-gradient(135deg, #B5F0E3 0%, #D5FFF5 100%)',
  Yellow: 'linear-gradient(135deg, #FFE066 0%, #FFF099 100%)',
};

const COLOR_SOLID_MAP_DARK: Record<Color, string> = {
  Red: '#FF9999',
  Blue: '#7EDDD6',
  Green: '#B5F0E3',
  Yellow: '#FFE066',
};

export class ColorUtils {
  static toHex(color: GameColor, theme: 'light' | 'dark' = 'light'): string {
    return theme === 'dark' ? COLOR_HEX_MAP_DARK[color] : COLOR_HEX_MAP_LIGHT[color];
  }

  static validate(color: string): color is GameColor {
    return color in COLOR_HEX_MAP_LIGHT;
  }

  static getGradient(color: GameColor, useGradient: boolean, theme: 'light' | 'dark' = 'light'): string {
    if (useGradient) {
      return theme === 'dark' ? COLOR_GRADIENT_MAP_DARK[color] : COLOR_GRADIENT_MAP_LIGHT[color];
    }
    return theme === 'dark' ? COLOR_SOLID_MAP_DARK[color] : COLOR_SOLID_MAP_LIGHT[color];
  }

  static getSolidColor(color: GameColor, theme: 'light' | 'dark' = 'light'): string {
    return theme === 'dark' ? COLOR_SOLID_MAP_DARK[color] : COLOR_SOLID_MAP_LIGHT[color];
  }
}

