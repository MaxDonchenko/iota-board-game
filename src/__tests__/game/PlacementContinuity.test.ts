import { describe, it, expect } from 'vitest';
import { Grid } from '@/game/Grid';
import { Card } from '@/game/Card';
import { Validation } from '@/game/Validation';

describe('Placement Continuity and Adjacency', () => {
  it('should reject a distant single card placement', () => {
    const grid = new Grid();
    grid.addCard(0, 0, new Card('Square', 1, 'Red'));

    // Attempting to place a card at (2, 0) when only (0, 0) is occupied
    const placements = [{ card: new Card('Square', 2, 'Red'), position: { x: 2, y: 0 } }];

    const result = Validation.validatePlacement(placements, grid);
    expect(result.isValid).toBe(false);
  });

  it('should reject a distant line placement', () => {
    const grid = new Grid();
    grid.addCard(0, 0, new Card('Square', 1, 'Red'));

    // Attempting to place (4,0) and (5,0) when (0,0) is the only card
    const placements = [
      { card: new Card('Square', 2, 'Red'), position: { x: 4, y: 0 } },
      { card: new Card('Square', 3, 'Red'), position: { x: 5, y: 0 } },
    ];

    const result = Validation.validatePlacement(placements, grid);
    expect(result.isValid).toBe(false);
  });

  it('should reject a line with gaps (not filled by grid cards)', () => {
    const grid = new Grid();
    grid.addCard(0, 0, new Card('Square', 1, 'Red'));

    // (1,0) is empty. (2,0) and (3,0) are being placed.
    const placements = [
      { card: new Card('Square', 2, 'Red'), position: { x: 2, y: 0 } },
      { card: new Card('Square', 3, 'Red'), position: { x: 3, y: 0 } },
    ];

    const result = Validation.validatePlacement(placements, grid);
    expect(result.isValid).toBe(false);
  });

  it('should allow a line with gaps if filled by grid cards', () => {
    const grid = new Grid();
    grid.addCard(0, 0, new Card('Square', 1, 'Red'));
    grid.addCard(1, 0, new Card('Circle', 1, 'Red')); // Gap filler

    // Placing at (-1, 0) and (2, 0) - both adjacent to grid, straight line
    const placements = [
      { card: new Card('Triangle', 1, 'Red'), position: { x: -1, y: 0 } },
      { card: new Card('Plus', 1, 'Red'), position: { x: 2, y: 0 } },
    ];

    const result = Validation.validatePlacement(placements, grid);
    expect(result.isValid).toBe(true);
  });

  it('should reject a distant cell even if in the same line as grid cards', () => {
    const grid = new Grid();
    grid.addCard(0, 0, new Card('Square', 1, 'Red'));

    // (0, 0) is occupied. (2, 0) should be invalid for first placement of the turn.
    const placements = [{ card: new Card('Square', 2, 'Red'), position: { x: 2, y: 0 } }];

    const result = Validation.validatePlacement(placements, grid);
    expect(result.isValid).toBe(false);
  });
});
