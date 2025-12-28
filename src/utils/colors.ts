import type { Color } from '@/types/Card.types';

export type GameColor = Color;

// Base colors from RGB values
// Red: rgb(238 29 36) = #EE1D24
// Yellow: rgb(249 165 27) = #F9A51B
// Green: rgb(97 187 70) = #61BB46
// Blue: rgb(37 131 197) = #2583C5

// Light mode colors (base colors, for white text)
const COLOR_HEX_MAP_LIGHT: Record<Color, string> = {
  Red: '#EE1D24',
  Yellow: '#F9A51B',
  Green: '#61BB46',
  Blue: '#2583C5',
};

const COLOR_GRADIENT_MAP_LIGHT: Record<Color, string> = {
  Red: 'linear-gradient(135deg, #EE1D24 0%, #FF3D44 100%)',
  Yellow: 'linear-gradient(135deg, #F9A51B 0%, #FFB53B 100%)',
  Green: 'linear-gradient(135deg, #61BB46 0%, #81DB66 100%)',
  Blue: 'linear-gradient(135deg, #2583C5 0%, #45A3E5 100%)',
};

const COLOR_SOLID_MAP_LIGHT: Record<Color, string> = {
  Red: '#EE1D24',
  Yellow: '#F9A51B',
  Green: '#61BB46',
  Blue: '#2583C5',
};

// Dark mode colors (lighter versions, for black text)
const COLOR_HEX_MAP_DARK: Record<Color, string> = {
  Red: '#FF5D64',
  Yellow: '#FFC55B',
  Green: '#91DB7A',
  Blue: '#65B3E5',
};

const COLOR_GRADIENT_MAP_DARK: Record<Color, string> = {
  Red: 'linear-gradient(135deg, #FF5D64 0%, #FF7D84 100%)',
  Yellow: 'linear-gradient(135deg, #FFC55B 0%, #FFE57B 100%)',
  Green: 'linear-gradient(135deg, #91DB7A 0%, #B1FB9A 100%)',
  Blue: 'linear-gradient(135deg, #65B3E5 0%, #85D3FF 100%)',
};

const COLOR_SOLID_MAP_DARK: Record<Color, string> = {
  Red: '#FF5D64',
  Yellow: '#FFC55B',
  Green: '#91DB7A',
  Blue: '#65B3E5',
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

