import { describe, it, expect } from 'vitest';
import { Validation } from '@/game/Validation';
import { Grid } from '@/game/Grid';
import { Card } from '@/game/Card';

describe('Validation - Wildcard Scenarios', () => {
  it('should correctly validate subsequent placements after a wildcard with an assigned value', () => {
    const grid = new Grid();

    // Initial setup (Simplified version of user reported scenario)
    // Horizontal anchor line at y=0
    grid.addCard(0, 0, new Card('Square', 2, 'Blue'));
    grid.addCard(-1, 0, new Card('Square', 1, 'Red'));
    grid.addCard(-2, 0, new Card('Square', 3, 'Yellow'));

    // Vertical anchor at (-2, 1)
    grid.addCard(-2, 1, new Card('Square', 3, 'Blue'));

    // 1. Place a Wildcard at (-3, 0).
    // This forms a horizontal line at y=0: Red Sq 1, Yellow Sq 3, Wildcard.
    // To be valid, Wildcard at (-3, 0) could be "Green Square 4" (Different Color, Different Number, Same Shape)
    const wildcard = new Card('Square', 1, 'Red', true);
    wildcard.wildValue = { shape: 'Square', number: 4, color: 'Green' };

    // 2. Place a Green Square 3 at (-3, 1)
    // This forms a horizontal line at y=1: (-2, 1) Blue Sq 3, (-3, 1) Green Sq 3
    // AND a vertical line at x=-3: (-3, 0) Green Sq 4 (Wild), (-3, 1) Green Sq 3
    const greenSq3 = new Card('Square', 3, 'Green');

    // 3. Place a Green Square 2 at (-3, 2)
    // This extends the vertical line at x=-3: Green Sq 4 (Wild), Green Sq 3, Green Sq 2
    const greenSq2 = new Card('Square', 2, 'Green');

    const placements = [
      { card: wildcard, position: { x: -3, y: 0 } },
      { card: greenSq3, position: { x: -3, y: 1 } },
      { card: greenSq2, position: { x: -3, y: 2 } },
    ];

    // Validation should consider the wildValue assigned to the wildcard
    const result = Validation.validatePlacement(placements, grid);

    expect(result.isValid).toBe(true);
    if (!result.isValid) {
      console.log('Validation Error:', result.error);
    }
  });

  it('should reject if wildcard value makes a line invalid', () => {
    const grid = new Grid();
    grid.addCard(0, 0, new Card('Square', 1, 'Red'));

    const wildcard = new Card('Square', 1, 'Red', true);
    // Setting value to Red Square 1 (same as adjacent, making it invalid due to duplicate)
    wildcard.wildValue = { shape: 'Square', number: 1, color: 'Red' };

    const placements = [{ card: wildcard, position: { x: 1, y: 0 } }];

    const result = Validation.validatePlacement(placements, grid);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('unique');
  });
});
