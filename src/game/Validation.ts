import { Grid } from './Grid';
import { Card } from './Card';
import { MAX_LINE_LENGTH } from './constants';
import type { Coordinate, Line } from '@/types/Grid.types';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface Placement {
  card: Card;
  position: Coordinate;
}

export class Validation {
  static validatePlacement(placements: Placement[], grid: Grid): ValidationResult {
    if (placements.length === 0) {
      return { isValid: false, error: 'No cards to place' };
    }

    if (placements.length > MAX_LINE_LENGTH) {
      return { isValid: false, error: `Cannot place more than ${MAX_LINE_LENGTH} cards` };
    }

    // Check if positions are valid (continuous line, adjacent to grid)
    const positions = placements.map(p => p.position);
    if (!grid.isValidPlacement(positions)) {
      return { isValid: false, error: 'Cards must form a continuous line adjacent to existing cards' };
    }

    // Check if any position already has a card
    for (const placement of placements) {
      if (grid.hasCard(placement.position.x, placement.position.y)) {
        return { isValid: false, error: 'Position already occupied' };
      }
    }

    // Validate line rules
    const cards = placements.map(p => p.card);
    const lineResult = this.validateLineRules(cards);
    if (!lineResult.isValid) {
      return lineResult;
    }

    // Check wild card consistency across all lines they belong to
    const wildCardResult = this.validateWildCardConsistency(placements, grid);
    if (!wildCardResult.isValid) {
      return wildCardResult;
    }

    return { isValid: true };
  }

  static validateLineRules(cards: Card[]): ValidationResult {
    if (cards.length < 2) {
      return { isValid: false, error: 'Line must have at least 2 cards' };
    }

    if (cards.length > MAX_LINE_LENGTH) {
      return { isValid: false, error: `Line cannot exceed ${MAX_LINE_LENGTH} cards` };
    }

    // Check each property: all same OR all different
    const shapes = cards.map(c => c.getEffectiveShape());
    const numbers = cards.map(c => c.getEffectiveNumber());
    const colors = cards.map(c => c.getEffectiveColor());

    // Check shapes
    const allSameShape = shapes.every(s => s === shapes[0]);
    const allDifferentShape = new Set(shapes).size === shapes.length;
    if (!allSameShape && !allDifferentShape) {
      return { isValid: false, error: 'Shapes must be all the same or all different' };
    }

    // Check numbers
    const allSameNumber = numbers.every(n => n === numbers[0]);
    const allDifferentNumber = new Set(numbers).size === numbers.length;
    if (!allSameNumber && !allDifferentNumber) {
      return { isValid: false, error: 'Numbers must be all the same or all different' };
    }

    // Check colors
    const allSameColor = colors.every(c => c === colors[0]);
    const allDifferentColor = new Set(colors).size === colors.length;
    if (!allSameColor && !allDifferentColor) {
      return { isValid: false, error: 'Colors must be all the same or all different' };
    }

    return { isValid: true };
  }

  static validateLine(line: Line): boolean {
    return this.validateLineRules(line.cards).isValid;
  }

  static validateWildCardConsistency(placements: Placement[], grid: Grid): ValidationResult {
    // Find all wild cards being placed
    const wildPlacements = placements.filter(p => p.card.isWild);

    for (const wildPlacement of wildPlacements) {
      const wildCard = wildPlacement.card;
      
      // If wild card doesn't have a value set, we need to determine it from context
      if (!wildCard.wildValue) {
        // This will be set during placement based on line constraints
        continue;
      }

      // Check all lines this wild card will belong to
      const affectedLines = this.getAffectedLines(wildPlacement.position, grid, placements);
      
      for (const line of affectedLines) {
        // Verify wild card value is consistent with line rules
        const lineCards = [...line.cards];
        // Replace wild card in line with its effective values
        const effectiveCards = lineCards.map(c => {
          if (c === wildCard) {
            return new Card(
              wildCard.wildValue.shape,
              wildCard.wildValue.number,
              wildCard.wildValue.color
            );
          }
          return c;
        });

        const lineResult = this.validateLineRules(effectiveCards);
        if (!lineResult.isValid) {
          return { isValid: false, error: 'Wild card value inconsistent with line rules' };
        }
      }
    }

    return { isValid: true };
  }

  private static getAffectedLines(
    position: Coordinate,
    grid: Grid,
    newPlacements: Placement[]
  ): Line[] {
    const lines: Line[] = [];
    
    // Check horizontal line
    const hLine = grid.getLine(position.x, position.y, 'horizontal');
    if (hLine) {
      lines.push(hLine);
    }

    // Check vertical line
    const vLine = grid.getLine(position.x, position.y, 'vertical');
    if (vLine) {
      lines.push(vLine);
    }

    return lines;
  }

  static canReplaceWild(wildCard: Card, replacementCard: Card, grid: Grid): boolean {
    if (!wildCard.isWild) {
      return false;
    }

    if (replacementCard.isWild) {
      return false;
    }

    // Check if replacement card matches wild card's value
    if (!wildCard.wildValue) {
      return false;
    }

    return wildCard.wildValue.shape === replacementCard.shape &&
           wildCard.wildValue.number === replacementCard.number &&
           wildCard.wildValue.color === replacementCard.color;
  }
}

