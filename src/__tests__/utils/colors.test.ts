import { describe, it, expect } from 'vitest';
import { ColorUtils } from '@/utils/colors';
import type { GameColor } from '@/types/Card.types';

describe('ColorUtils', () => {
  it('should convert color to hex', () => {
    expect(ColorUtils.toHex('Red')).toBe('#FF6B6B');
    expect(ColorUtils.toHex('Blue')).toBe('#4ECDC4');
    expect(ColorUtils.toHex('Green')).toBe('#95E1D3');
    expect(ColorUtils.toHex('Yellow')).toBe('#FFD700');
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
    const gradient = ColorUtils.getGradient('Red', true);
    expect(gradient).toContain('gradient');
    expect(gradient).toContain('#FF6B6B');
  });

  it('should return solid color when gradient disabled', () => {
    const gradient = ColorUtils.getGradient('Red', false);
    expect(gradient).not.toContain('gradient');
    expect(gradient).toContain('#FF6B6B');
  });

  it('should return yolk-like gradient for yellow', () => {
    const gradient = ColorUtils.getGradient('Yellow', true);
    expect(gradient).toContain('#FFD700');
    expect(gradient).toContain('#FFA500');
  });
});

