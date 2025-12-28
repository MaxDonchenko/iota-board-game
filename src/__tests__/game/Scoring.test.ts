import { describe, it, expect } from 'vitest';
import { Scoring } from '@/game/Scoring';
import { Card } from '@/game/Card';
import type { Line } from '@/types/Grid.types';

describe('Scoring', () => {
  it('should return correct card value for regular card', () => {
    const card = new Card('Square', 3, 'Red');
    expect(Scoring.getCardValue(card)).toBe(3);
  });

  it('should return 0 for wild card', () => {
    const card = new Card('Square', 1, 'Red', true);
    expect(Scoring.getCardValue(card)).toBe(0);
  });

  it('should calculate base score for a line', () => {
    const line: Line = {
      cards: [
        new Card('Square', 1, 'Red'),
        new Card('Square', 2, 'Red'),
        new Card('Square', 3, 'Red'),
      ],
      positions: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ],
      direction: 'horizontal',
    };
    
    expect(Scoring.calculateLineScore(line)).toBe(6); // 1 + 2 + 3
  });

  it('should detect lots (4-card lines)', () => {
    const lines: Line[] = [
      {
        cards: [
          new Card('Square', 1, 'Red'),
          new Card('Square', 2, 'Red'),
          new Card('Square', 3, 'Red'),
          new Card('Square', 4, 'Red'),
        ],
        positions: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 2, y: 0 },
          { x: 3, y: 0 },
        ],
        direction: 'horizontal',
      },
      {
        cards: [
          new Card('Circle', 1, 'Blue'),
          new Card('Circle', 2, 'Blue'),
        ],
        positions: [
          { x: 0, y: 1 },
          { x: 1, y: 1 },
        ],
        direction: 'horizontal',
      },
    ];
    
    expect(Scoring.detectLots(lines)).toBe(1);
  });

  it('should apply doubling for lots', () => {
    const lines: Line[] = [
      {
        cards: [
          new Card('Square', 1, 'Red'),
          new Card('Square', 2, 'Red'),
          new Card('Square', 3, 'Red'),
          new Card('Square', 4, 'Red'),
        ],
        positions: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 2, y: 0 },
          { x: 3, y: 0 },
        ],
        direction: 'horizontal',
      },
    ];
    
    const result = Scoring.calculateTurnScore(lines, 4, false);
    expect(result.lots).toBe(1);
    expect(result.finalScore).toBe(20); // (1+2+3+4) * 2 = 20
  });

  it('should double again for playing all 4 cards', () => {
    const lines: Line[] = [
      {
        cards: [
          new Card('Square', 1, 'Red'),
          new Card('Square', 2, 'Red'),
        ],
        positions: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
        ],
        direction: 'horizontal',
      },
    ];
    
    const result = Scoring.calculateTurnScore(lines, 4, false);
    expect(result.playedAllFour).toBe(true);
    expect(result.finalScore).toBe(6); // (1+2) * 2 = 6
  });

  it('should double for final turn', () => {
    const lines: Line[] = [
      {
        cards: [
          new Card('Square', 1, 'Red'),
          new Card('Square', 2, 'Red'),
        ],
        positions: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
        ],
        direction: 'horizontal',
      },
    ];
    
    const result = Scoring.calculateTurnScore(lines, 2, true);
    expect(result.isFinalTurn).toBe(true);
    expect(result.finalScore).toBe(6); // (1+2) * 2 = 6
  });

  it('should handle multiple doubling effects', () => {
    const lines: Line[] = [
      {
        cards: [
          new Card('Square', 1, 'Red'),
          new Card('Square', 2, 'Red'),
          new Card('Square', 3, 'Red'),
          new Card('Square', 4, 'Red'),
        ],
        positions: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 2, y: 0 },
          { x: 3, y: 0 },
        ],
        direction: 'horizontal',
      },
    ];
    
    // Lot (x2) + All 4 cards (x2) = x4 total
    const result = Scoring.calculateTurnScore(lines, 4, false);
    expect(result.finalScore).toBe(40); // (1+2+3+4) * 2 * 2 = 40
  });

  it('should handle wild cards with 0 value', () => {
    const line: Line = {
      cards: [
        new Card('Square', 1, 'Red'),
        new Card('Square', 2, 'Red', true), // Wild card
        new Card('Square', 3, 'Red'),
      ],
      positions: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ],
      direction: 'horizontal',
    };
    
    expect(Scoring.calculateLineScore(line)).toBe(4); // 1 + 0 + 3
  });
});

