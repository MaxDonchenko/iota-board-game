import { describe, it, expect } from 'vitest';
import { Validation } from '@/game/Validation';
import { Grid } from '@/game/Grid';
import { Card } from '@/game/Card';
import type { Placement } from '@/types/Grid.types';

describe('Validation', () => {
  it('should validate a valid line with all same color', () => {
    const line = {
      cards: [
        new Card('Square', 1, 'Red'),
        new Card('Circle', 2, 'Red'),
        new Card('Triangle', 3, 'Red'),
      ],
      positions: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ],
      direction: 'horizontal' as const,
    };
    
    expect(Validation.validateLine(line)).toBe(true);
  });

  it('should validate a valid line with all different colors', () => {
    const line = {
      cards: [
        new Card('Square', 1, 'Red'),
        new Card('Square', 2, 'Blue'),
        new Card('Square', 3, 'Green'),
      ],
      positions: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ],
      direction: 'horizontal' as const,
    };
    
    expect(Validation.validateLine(line)).toBe(true);
  });

  it('should reject invalid line with mixed colors', () => {
    const line = {
      cards: [
        new Card('Square', 1, 'Red'),
        new Card('Square', 2, 'Red'),
        new Card('Square', 3, 'Blue'), // Mixed: 2 red, 1 blue
      ],
      positions: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ],
      direction: 'horizontal' as const,
    };
    
    expect(Validation.validateLine(line)).toBe(false);
  });

  it('should validate line with all same shapes', () => {
    const line = {
      cards: [
        new Card('Square', 1, 'Red'),
        new Card('Square', 2, 'Blue'),
        new Card('Square', 3, 'Green'),
      ],
      positions: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ],
      direction: 'horizontal' as const,
    };
    
    expect(Validation.validateLine(line)).toBe(true);
  });

  it('should validate line with all different numbers', () => {
    const line = {
      cards: [
        new Card('Square', 1, 'Red'),
        new Card('Circle', 2, 'Red'),
        new Card('Triangle', 3, 'Red'),
        new Card('Plus', 4, 'Red'),
      ],
      positions: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
      ],
      direction: 'horizontal' as const,
    };
    
    expect(Validation.validateLine(line)).toBe(true);
  });

  it('should reject line exceeding max length', () => {
    const line = {
      cards: [
        new Card('Square', 1, 'Red'),
        new Card('Square', 2, 'Red'),
        new Card('Square', 3, 'Red'),
        new Card('Square', 4, 'Red'),
        new Card('Square', 1, 'Red'), // 5th card - invalid
      ],
      positions: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
        { x: 4, y: 0 },
      ],
      direction: 'horizontal' as const,
    };
    
    expect(Validation.validateLine(line)).toBe(false);
  });

  it('should validate placement connected to grid', () => {
    const grid = new Grid();
    grid.setStarterCard(0, 0, new Card('Square', 1, 'Red'));
    
    const placements: Placement[] = [
      {
        card: new Card('Square', 2, 'Red'),
        position: { x: 1, y: 0 },
      },
    ];
    
    const result = Validation.validatePlacement(placements, grid);
    expect(result.isValid).toBe(true);
  });

  it('should reject placement not connected to grid', () => {
    const grid = new Grid();
    grid.setStarterCard(0, 0, new Card('Square', 1, 'Red'));
    
    const placements: Placement[] = [
      {
        card: new Card('Square', 2, 'Red'),
        position: { x: 5, y: 5 }, // Not adjacent
      },
    ];
    
    const result = Validation.validatePlacement(placements, grid);
    expect(result.isValid).toBe(false);
  });
});

