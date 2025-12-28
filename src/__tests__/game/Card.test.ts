import { describe, it, expect } from 'vitest';
import { Card } from '@/game/Card';
import type { WildValue } from '@/types/Card.types';

describe('Card', () => {
  it('should create a card with correct properties', () => {
    const card = new Card('Square', 1, 'Red');
    expect(card.shape).toBe('Square');
    expect(card.number).toBe(1);
    expect(card.color).toBe('Red');
    expect(card.isWild).toBe(false);
  });

  it('should return correct value for regular card', () => {
    const card = new Card('Circle', 3, 'Blue');
    expect(card.getValue()).toBe(3);
  });

  it('should return 0 for wild card', () => {
    const card = new Card('Square', 1, 'Red', true);
    expect(card.getValue()).toBe(0);
  });

  it('should set wild value correctly', () => {
    const card = new Card('Square', 1, 'Red', true);
    const wildValue: WildValue = {
      shape: 'Triangle',
      number: 2,
      color: 'Blue',
    };
    card.setWildValue(wildValue);
    expect(card.wildValue).toEqual(wildValue);
  });

  it('should compare cards correctly', () => {
    const card1 = new Card('Square', 1, 'Red');
    const card2 = new Card('Square', 1, 'Red');
    const card3 = new Card('Circle', 1, 'Red');
    
    expect(card1.equals(card2)).toBe(true);
    expect(card1.equals(card3)).toBe(false);
  });
});

