import { describe, it, expect } from 'vitest';
import { Scoring } from '@/game/Scoring';
import { Card } from '@/game/Card';
import type { Line } from '@/types/Grid.types';

describe('Scoring', () => {
  it('should return correct card value for regular card', () => {
    const card = new Card('Square', 3, 'Red');
    expect(Scoring.getCardValue(card)).toBe(3);
  });

  it('should return 0 for wild card in hand (no value set)', () => {
    const card = new Card(undefined, undefined, undefined, true);
    expect(Scoring.getCardValue(card)).toBe(0);
  });

  it('should return correct value for placed wild card', () => {
    const card = new Card(undefined, undefined, undefined, true, {
      shape: 'Square',
      number: 3,
      color: 'Red',
    });
    expect(Scoring.getCardValue(card)).toBe(3);
  });

  it('should update value when setWildValue is called', () => {
    const card = new Card(undefined, undefined, undefined, true);
    expect(Scoring.getCardValue(card)).toBe(0);
    card.setWildValue({ shape: 'Circle', number: 4, color: 'Blue' });
    expect(Scoring.getCardValue(card)).toBe(4);
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
        cards: [new Card('Circle', 1, 'Blue'), new Card('Circle', 2, 'Blue')],
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

    // When playing 4 cards that form a lot, both lot multiplier and all-4 multiplier apply
    const result = Scoring.calculateTurnScore(lines, 4, false);
    expect(result.lots).toBe(1);
    expect(result.playedAllFour).toBe(true);
    expect(result.finalScore).toBe(40); // (1+2+3+4) * 2 (lot) * 2 (all 4) = 40
  });

  it('should double again for playing all 4 cards', () => {
    const lines: Line[] = [
      {
        cards: [new Card('Square', 1, 'Red'), new Card('Square', 2, 'Red')],
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
        cards: [new Card('Square', 1, 'Red'), new Card('Square', 2, 'Red')],
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

  it('should double turn score for completing one lot', () => {
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

    // 1 lot, but only 1 card played (completing a line already on board)
    const result = Scoring.calculateTurnScore(lines, 1, false);
    expect(result.lots).toBe(1);
    expect(result.finalScore).toBe(20); // (1+2+3+4) * 2 = 20
  });

  it('should double multiplicatively for completing multiple lots', () => {
    // Scenario: A cross where one card completes two lines of 4
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
          new Card('Circle', 1, 'Red'),
          new Card('Triangle', 1, 'Red'),
          new Card('Plus', 1, 'Red'),
          new Card('Square', 1, 'Red'), // Intersection
        ],
        positions: [
          { x: 0, y: -3 },
          { x: 0, y: -2 },
          { x: 0, y: -1 },
          { x: 0, y: 0 },
        ],
        direction: 'vertical',
      },
    ];

    // Base score: (1+2+3+4) + (1+1+1+1) = 14
    // 2 lots -> 14 * 2 * 2 = 56
    const result = Scoring.calculateTurnScore(lines, 1, false);
    expect(result.lots).toBe(2);
    expect(result.finalScore).toBe(56);
  });

  it('should handle extreme case with 3 lots (hypothetically possible)', () => {
    // Testing applyDoubling directly for 3 lots
    const baseScore = 10;
    const finalScore = Scoring.applyDoubling(baseScore, 3, false, false);
    expect(finalScore).toBe(80); // 10 * 2 * 2 * 2 = 80
  });

  it('should handle wild cards with their represented value', () => {
    const line: Line = {
      cards: [
        new Card('Square', 1, 'Red'),
        new Card(undefined, undefined, undefined, true, {
          shape: 'Square',
          number: 2,
          color: 'Red',
        }), // Wild card as 2
        new Card('Square', 3, 'Red'),
      ],
      positions: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ],
      direction: 'horizontal',
    };

    expect(Scoring.calculateLineScore(line)).toBe(6); // 1 + 2 + 3 = 6
  });
});
