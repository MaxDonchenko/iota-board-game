import { describe, it, expect } from 'vitest';
import { Deck } from '@/game/Deck';
import { Card } from '@/game/Card';

describe('Deck', () => {
  it('should create a full deck with 64 cards + 2 wild cards', () => {
    const deck = new Deck('full');
    expect(deck.cards.length).toBe(66); // 64 regular + 2 wild
  });

  it('should create a short deck with 32 cards + 1 wild card', () => {
    const deck = new Deck('short');
    expect(deck.cards.length).toBe(33); // 32 regular + 1 wild
  });

  it('should shuffle the deck', () => {
    const deck1 = new Deck('full');
    const deck2 = new Deck('full');
    
    const originalOrder1 = deck1.cards.map(c => c.toString());
    const originalOrder2 = deck2.cards.map(c => c.toString());
    
    deck1.shuffle();
    deck2.shuffle();
    
    const shuffledOrder1 = deck1.cards.map(c => c.toString());
    const shuffledOrder2 = deck2.cards.map(c => c.toString());
    
    // At least one deck should be shuffled (very unlikely both are in same order)
    const isShuffled1 = originalOrder1.join(',') !== shuffledOrder1.join(',');
    const isShuffled2 = originalOrder2.join(',') !== shuffledOrder2.join(',');
    
    expect(isShuffled1 || isShuffled2).toBe(true);
  });

  it('should deal 4 cards to a player', () => {
    const deck = new Deck('full');
    const cards = deck.dealCards(4);
    expect(cards.length).toBe(4);
    expect(deck.cards.length).toBe(62); // 66 - 4
  });

  it('should draw a card from draw pile', () => {
    const deck = new Deck('full');
    const initialCount = deck.cards.length;
    const card = deck.drawCard();
    
    expect(card).toBeInstanceOf(Card);
    expect(deck.cards.length).toBe(initialCount - 1);
  });

  it('should return undefined when draw pile is empty', () => {
    const deck = new Deck('full');
    // Draw all cards from draw pile
    while (deck.drawPile.length > 0) {
      deck.drawCard();
    }
    
    const card = deck.drawCard();
    expect(card).toBeUndefined();
  });

  it('should have correct number of wild cards in full mode', () => {
    const deck = new Deck('full');
    const wildCards = deck.cards.filter(c => c.isWild);
    expect(wildCards.length).toBe(2);
  });

  it('should have correct number of wild cards in short mode', () => {
    const deck = new Deck('short');
    const wildCards = deck.cards.filter(c => c.isWild);
    expect(wildCards.length).toBe(1);
  });
});

