import { describe, it, expect } from 'vitest';
import { ColorUtils } from '@/utils/colors';
import type { GameColor } from '@/types/Card.types';

describe('ColorUtils', () => {
  it('should convert color to hex', () => {
    expect(ColorUtils.toHex('Red', 'light')).toBe('#CC3333');
    expect(ColorUtils.toHex('Blue', 'light')).toBe('#2E8B87');
    expect(ColorUtils.toHex('Green', 'light')).toBe('#5FAE9E');
    expect(ColorUtils.toHex('Yellow', 'light')).toBe('#CC9900');
    expect(ColorUtils.toHex('Red', 'dark')).toBe('#FF9999');
    expect(ColorUtils.toHex('Blue', 'dark')).toBe('#7EDDD6');
    expect(ColorUtils.toHex('Green', 'dark')).toBe('#B5F0E3');
    expect(ColorUtils.toHex('Yellow', 'dark')).toBe('#FFE066');
  });

  it('should validate color strings', () => {
    expect(ColorUtils.validate('Red')).toBe(true);
    expect(ColorUtils.validate('Blue')).toBe(true);
    expect(ColorUtils.validate('Green')).toBe(true);
    expect(ColorUtils.validate('Yellow')).toBe(true);
    expect(ColorUtils.validate('Orange')).toBe(false);
    expect(ColorUtils.validate('Purple')).toBe(false);
    expect(ColorUtils.validate('red')).toBe(false); // Case sensitive
  });

  it('should return gradient for color when enabled', () => {
    const gradient = ColorUtils.getGradient('Red', true, 'light');
    expect(gradient).toContain('gradient');
    expect(gradient).toContain('#CC3333');
  });

  it('should return solid color when gradient disabled', () => {
    const gradient = ColorUtils.getGradient('Red', false, 'light');
    expect(gradient).not.toContain('gradient');
    expect(gradient).toBe('#CC3333');
  });

  it('should return yolk-like gradient for yellow', () => {
    const gradient = ColorUtils.getGradient('Yellow', true, 'light');
    expect(gradient).toContain('#CC9900');
  });

  it('should return different colors for dark theme', () => {
    const darkGradient = ColorUtils.getGradient('Red', false, 'dark');
    const lightGradient = ColorUtils.getGradient('Red', false, 'light');
    expect(darkGradient).not.toBe(lightGradient);
    expect(darkGradient).toBe('#FF9999');
  });
});

