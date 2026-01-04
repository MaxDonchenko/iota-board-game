import { describe, it, expect } from 'vitest';
import { Card } from '@/game/Card';

describe('Card - Wildcard construction', () => {
  it('creates wildcard without default shape/number/color and accepts wildValue', () => {
    const wildcard = new Card('Square', 1, 'Red', true);

    expect(wildcard.isWild).toBe(true);
    // Ensure constructor did not keep the provided shape/number/color for wildcards
    expect(wildcard.shape).toBeUndefined();
    expect(wildcard.number).toBeUndefined();
    expect(wildcard.color).toBeUndefined();
    expect(wildcard.wildValue).toBeUndefined();

    // Assign a preview value and verify effective getters
    const value = { shape: 'Triangle', number: 3, color: 'Red' } as const;
    wildcard.setWildValue(value as any);

    expect(wildcard.wildValue).toEqual(value);
    expect(wildcard.getEffectiveShape()).toBe('Triangle');
    expect(wildcard.getEffectiveNumber()).toBe(3);
    expect(wildcard.getEffectiveColor()).toBe('Red');
  });
});
