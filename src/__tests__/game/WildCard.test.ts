import { describe, it, expect } from 'vitest';
import { WildCardManager } from '@/game/WildCard';
import { Card } from '@/game/Card';
import { Grid } from '@/game/Grid';
import type { WildValue } from '@/types/Card.types';

describe('WildCardManager', () => {
  it('should check if wild card can be replaced', () => {
    const wildCard = new Card('Square', 1, 'Red', true);
    wildCard.setWildValue({
      shape: 'Square',
      number: 1,
      color: 'Red',
    });
    const playerHand = [
      new Card('Square', 1, 'Red'),
      new Card('Circle', 2, 'Blue'),
    ];
    
    expect(WildCardManager.canReplaceWild(wildCard, playerHand)).toBe(true);
  });

  it('should return false if no matching card in hand', () => {
    const wildCard = new Card('Square', 1, 'Red', true);
    wildCard.setWildValue({
      shape: 'Square',
      number: 1,
      color: 'Red',
    });
    
    const playerHand = [
      new Card('Circle', 2, 'Blue'),
      new Card('Triangle', 3, 'Green'),
    ];
    
    expect(WildCardManager.canReplaceWild(wildCard, playerHand)).toBe(false);
  });

  it('should get wild value', () => {
    const card = new Card('Square', 1, 'Red', true);
    const wildValue: WildValue = {
      shape: 'Triangle',
      number: 2,
      color: 'Blue',
    };
    card.setWildValue(wildValue);
    
    expect(WildCardManager.getWildValue(card)).toEqual(wildValue);
  });

  it('should return undefined for non-wild card', () => {
    const card = new Card('Square', 1, 'Red');
    expect(WildCardManager.getWildValue(card)).toBeUndefined();
  });

  it('should set wild value', () => {
    const card = new Card('Square', 1, 'Red', true);
    const wildValue: WildValue = {
      shape: 'Circle',
      number: 3,
      color: 'Green',
    };
    
    WildCardManager.setWildValue(card, wildValue);
    expect(card.wildValue).toEqual(wildValue);
  });

  it('should replace wild card on grid', () => {
    const grid = new Grid();
    grid.setStarterCard(0, 0, new Card('Square', 1, 'Red'));
    
    const wildCard = new Card('Square', 1, 'Red', true);
    wildCard.setWildValue({
      shape: 'Square',
      number: 1,
      color: 'Red',
    });
    grid.addCard(1, 0, wildCard);
    
    const replacementCard = new Card('Square', 1, 'Red');
    const replacedCard = WildCardManager.replaceWild(
      {
        wildCard,
        replacementCard,
        position: { x: 1, y: 0 },
      },
      grid
    );
    
    expect(replacedCard).toEqual(wildCard);
    const cardAtPosition = grid.getCard(1, 0);
    expect(cardAtPosition?.equals(replacementCard)).toBe(true);
  });
});

