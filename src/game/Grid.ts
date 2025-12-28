import { Card } from './Card';
import type { Coordinate, Line, Direction } from '@/types/Grid.types';

export class Grid {
  positions: Map<string, Card> = new Map();
  starterCard?: Card;
  starterPosition?: Coordinate;

  private getKey(x: number, y: number): string {
    return `${x},${y}`;
  }

  private parseKey(key: string): Coordinate {
    const [x, y] = key.split(',').map(Number);
    return { x, y };
  }

  addCard(x: number, y: number, card: Card): void {
    const key = this.getKey(x, y);
    this.positions.set(key, card);
  }

  getCard(x: number, y: number): Card | undefined {
    const key = this.getKey(x, y);
    return this.positions.get(key);
  }

  hasCard(x: number, y: number): boolean {
    return this.getCard(x, y) !== undefined;
  }

  setStarterCard(x: number, y: number, card: Card): void {
    this.starterCard = card;
    this.starterPosition = { x, y };
    this.addCard(x, y, card);
  }

  getStarterCard(): Card | undefined {
    return this.starterCard;
  }

  getStarterPosition(): Coordinate | undefined {
    return this.starterPosition;
  }

  getAdjacentCells(x: number, y: number): Coordinate[] {
    const adjacent: Coordinate[] = [
      { x: x + 1, y },
      { x: x - 1, y },
      { x, y: y + 1 },
      { x, y: y - 1 },
    ];
    return adjacent.filter(pos => !this.hasCard(pos.x, pos.y));
  }

  getOccupiedAdjacentCells(x: number, y: number): Coordinate[] {
    const adjacent: Coordinate[] = [
      { x: x + 1, y },
      { x: x - 1, y },
      { x, y: y + 1 },
      { x, y: y - 1 },
    ];
    return adjacent.filter(pos => this.hasCard(pos.x, pos.y));
  }

  isContinuousLine(positions: Coordinate[]): boolean {
    if (positions.length <= 1) {
      return true;
    }

    // Check if all positions form a continuous line (horizontal or vertical)
    const sorted = [...positions].sort((a, b) => {
      if (a.x !== b.x) return a.x - b.x;
      return a.y - b.y;
    });

    // Check if horizontal line
    const isHorizontal = sorted.every((pos, i) => 
      i === 0 || pos.x === sorted[0].x
    );
    if (isHorizontal) {
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i].y !== sorted[i - 1].y + 1) {
          return false;
        }
      }
      return true;
    }

    // Check if vertical line
    const isVertical = sorted.every((pos, i) => 
      i === 0 || pos.y === sorted[0].y
    );
    if (isVertical) {
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i].x !== sorted[i - 1].x + 1) {
          return false;
        }
      }
      return true;
    }

    return false;
  }

  getLine(x: number, y: number, direction: Direction): Line | null {
    const card = this.getCard(x, y);
    if (!card) {
      return null;
    }

    const positions: Coordinate[] = [{ x, y }];
    const cards: Card[] = [card];

    if (direction === 'horizontal') {
      // Extend left
      let leftX = x - 1;
      while (this.hasCard(leftX, y)) {
        const leftCard = this.getCard(leftX, y);
        if (leftCard) {
          positions.unshift({ x: leftX, y });
          cards.unshift(leftCard);
        }
        leftX--;
      }

      // Extend right
      let rightX = x + 1;
      while (this.hasCard(rightX, y)) {
        const rightCard = this.getCard(rightX, y);
        if (rightCard) {
          positions.push({ x: rightX, y });
          cards.push(rightCard);
        }
        rightX++;
      }
    } else {
      // Extend up
      let upY = y - 1;
      while (this.hasCard(x, upY)) {
        const upCard = this.getCard(x, upY);
        if (upCard) {
          positions.unshift({ x, y: upY });
          cards.unshift(upCard);
        }
        upY--;
      }

      // Extend down
      let downY = y + 1;
      while (this.hasCard(x, downY)) {
        const downCard = this.getCard(x, downY);
        if (downCard) {
          positions.push({ x, y: downY });
          cards.push(downCard);
        }
        downY++;
      }
    }

    if (positions.length < 2) {
      return null;
    }

    return {
      cards,
      positions,
      direction,
    };
  }

  getAllLines(): Line[] {
    const lines: Line[] = [];
    const processed = new Set<string>();

    for (const [key, card] of this.positions.entries()) {
      if (!card) continue;

      const pos = this.parseKey(key);
      
      // Check horizontal line
      const hKey = `h-${key}`;
      if (!processed.has(hKey)) {
        const hLine = this.getLine(pos.x, pos.y, 'horizontal');
        if (hLine && hLine.cards.length >= 2) {
          lines.push(hLine);
          hLine.positions.forEach(p => processed.add(`h-${this.getKey(p.x, p.y)}`));
        }
      }

      // Check vertical line
      const vKey = `v-${key}`;
      if (!processed.has(vKey)) {
        const vLine = this.getLine(pos.x, pos.y, 'vertical');
        if (vLine && vLine.cards.length >= 2) {
          lines.push(vLine);
          vLine.positions.forEach(p => processed.add(`v-${this.getKey(p.x, p.y)}`));
        }
      }
    }

    return lines;
  }

  isValidPlacement(positions: Coordinate[]): boolean {
    if (positions.length === 0) {
      return false;
    }

    // Check if positions form a continuous line
    if (!this.isContinuousLine(positions)) {
      return false;
    }

    // Check if at least one position is adjacent to existing cards
    if (this.positions.size === 0) {
      return true; // First card placement
    }

    return positions.some(pos => 
      this.getOccupiedAdjacentCells(pos.x, pos.y).length > 0
    );
  }

  clear(): void {
    this.positions.clear();
    this.starterCard = undefined;
    this.starterPosition = undefined;
  }
}

