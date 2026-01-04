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

  it('should NOT allow placing additional cards in same turn when wildcard has no value yet', () => {
    const grid = new Grid();
    grid.addCard(0, 0, new Card('Square', 1, 'Red'));

    // Wildcard without an assigned value (preview phase)
    const wildcard = new Card(undefined, undefined, undefined, true);

    // Another card to place to the right of the wildcard
    const card = new Card('Square', 2, 'Red');

    const placements = [
      { card: wildcard, position: { x: 1, y: 0 } },
      { card, position: { x: 2, y: 0 } },
    ];

    const result = Validation.validatePlacement(placements, grid);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Wildcard value');
  });

  it('should correctly handle the user-reported scenario: placeholder (wildcard as 2-red-triangle) then 3-red-triangle', () => {
    const grid = new Grid();
    // Starter: Triangle-1-Red at (0,0)
    grid.setStarterCard(0, 0, new Card('Triangle', 1, 'Red'));

    // Card 1: Wildcard at (1,0) valued as Triangle-2-Red
    const wildcard = new Card('Triangle', 2, 'Red', true, {
      shape: 'Triangle',
      number: 2,
      color: 'Red',
    });

    // Card 2: Triangle-3-Red at (2,0)
    const card3 = new Card('Triangle', 3, 'Red');

    const placements = [
      { card: wildcard, position: { x: 1, y: 0 } },
      { card: card3, position: { x: 2, y: 0 } },
    ];

    const result = Validation.validatePlacement(placements, grid);
    expect(result.isValid).toBe(true);
  });

  it('should mark all lines containing an unvalued wildcard as invalid (user reported scenario)', () => {
    const grid = new Grid();
    // Grid setup: (0,0) Green Triangle 4, (0,-1) Yellow Plus 4
    grid.addCard(0, 0, new Card('Triangle', 4, 'Green'));
    grid.addCard(0, -1, new Card('Plus', 4, 'Yellow'));

    // (-1,0) Green Square 2, (-1,-1) Red Square 4
    grid.addCard(-1, 0, new Card('Square', 2, 'Green'));
    grid.addCard(-1, -1, new Card('Square', 4, 'Red'));

    // 1. Place a Wildcard at (1, -1). It's to the right of (0, -1) Yellow Plus 4.
    const wildcard = new Card(undefined, undefined, undefined, true);

    // 2. Place a Green Circle 2 at (2, -1). It's to the right of the wildcard.
    const greenCircle2 = new Card('Circle', 2, 'Green');

    const placements = [
      { card: wildcard, position: { x: 1, y: -1 } },
      { card: greenCircle2, position: { x: 2, y: -1 } },
    ];

    const result = Validation.validatePlacement(placements, grid);

    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Wildcard');
  });
});
