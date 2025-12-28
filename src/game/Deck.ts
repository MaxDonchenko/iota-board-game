import { Card } from './Card';
import { SHAPES, NUMBERS, COLORS, DECK_SIZES, WILD_CARD_COUNTS } from './constants';
import type { GameMode } from '@/types/Game.types';

export class Deck {
  cards: Card[] = [];
  drawPile: Card[] = [];
  discardPile: Card[] = [];
  gameMode: GameMode = 'full';

  constructor(gameMode: GameMode = 'full') {
    this.gameMode = gameMode;
    this.createDeck(gameMode);
    this.shuffle();
  }

  private createDeck(gameMode: GameMode): void {
    this.cards = [];
    
    if (gameMode === 'full') {
      // Full mode: 64 cards (4 shapes × 4 numbers × 4 colors)
      for (const shape of SHAPES) {
        for (const number of NUMBERS) {
          for (const color of COLORS) {
            this.cards.push(new Card(shape, number, color));
          }
        }
      }
    } else {
      // Short mode: 32 cards (4 shapes × 4 numbers × 2 colors)
      const shortColors: typeof COLORS[number][] = ['Red', 'Blue'];
      for (const shape of SHAPES) {
        for (const number of NUMBERS) {
          for (const color of shortColors) {
            this.cards.push(new Card(shape, number, color));
          }
        }
      }
    }

    // Add wild cards (without default values - they're just wildcards)
    const wildCount = gameMode === 'full' ? WILD_CARD_COUNTS.FULL : WILD_CARD_COUNTS.SHORT;
    for (let i = 0; i < wildCount; i++) {
      // Create wildcard without a value - shape/number/color are just placeholders
      const wildCard = new Card('Square', 1, 'Red', true);
      // Ensure no default wildValue is set
      wildCard.wildValue = undefined;
      this.cards.push(wildCard);
    }
  }

  shuffle(): void {
    const shuffled = [...this.cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    this.drawPile = shuffled;
    this.cards = shuffled;
  }

  dealCards(count: number): Card[] {
    const dealt: Card[] = [];
    for (let i = 0; i < count && this.drawPile.length > 0; i++) {
      const card = this.drawPile.pop();
      if (card) {
        dealt.push(card);
      }
    }
    return dealt;
  }

  drawCard(): Card | undefined {
    return this.drawPile.pop();
  }

  addToDiscard(card: Card): void {
    this.discardPile.push(card);
  }

  addToDrawPile(card: Card): void {
    this.drawPile.push(card);
  }

  isEmpty(): boolean {
    return this.drawPile.length === 0;
  }

  getRemainingCount(): number {
    return this.drawPile.length;
  }
}

