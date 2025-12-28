import { describe, it, expect } from 'vitest';
import { ColorUtils } from '@/utils/colors';
import type { GameColor } from '@/types/Card.types';

describe('ColorUtils', () => {
  it('should convert color to hex', () => {
    expect(ColorUtils.toHex('Red', 'light')).toBe('#EE1D24');
    expect(ColorUtils.toHex('Blue', 'light')).toBe('#2583C5');
    expect(ColorUtils.toHex('Green', 'light')).toBe('#61BB46');
    expect(ColorUtils.toHex('Yellow', 'light')).toBe('#F9A51B');
    expect(ColorUtils.toHex('Red', 'dark')).toBe('#FF5D64');
    expect(ColorUtils.toHex('Blue', 'dark')).toBe('#65B3E5');
    expect(ColorUtils.toHex('Green', 'dark')).toBe('#91DB7A');
    expect(ColorUtils.toHex('Yellow', 'dark')).toBe('#FFC55B');
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
    expect(gradient).toContain('#EE1D24');
  });

  it('should return solid color when gradient disabled', () => {
    const gradient = ColorUtils.getGradient('Red', false, 'light');
    expect(gradient).not.toContain('gradient');
    expect(gradient).toBe('#EE1D24');
  });

  it('should return gradient for yellow', () => {
    const gradient = ColorUtils.getGradient('Yellow', true, 'light');
    expect(gradient).toContain('#F9A51B');
  });

  it('should return different colors for dark theme', () => {
    const darkGradient = ColorUtils.getGradient('Red', false, 'dark');
    const lightGradient = ColorUtils.getGradient('Red', false, 'light');
    expect(darkGradient).not.toBe(lightGradient);
    expect(darkGradient).toBe('#FF5D64');
  });
});

