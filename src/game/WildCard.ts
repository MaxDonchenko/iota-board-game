import { Card } from './Card';
import { Grid } from './Grid';
import { Validation } from './Validation';
import type { Coordinate } from '@/types/Grid.types';
import type { WildValue } from '@/types/Card.types';

export interface WildCardReplacement {
  wildCard: Card;
  replacementCard: Card;
  position: Coordinate;
}

export class WildCardManager {
  static canReplaceWild(wildCard: Card, playerHand: Card[]): boolean {
    if (!wildCard.isWild || !wildCard.wildValue) {
      return false;
    }

    return playerHand.some(
      (card) =>
        !card.isWild &&
        card.shape === wildCard.wildValue?.shape &&
        card.number === wildCard.wildValue?.number &&
        card.color === wildCard.wildValue?.color
    );
  }

  static replaceWild(replacement: WildCardReplacement, grid: Grid): Card {
    const { wildCard, replacementCard, position } = replacement;

    if (!Validation.canReplaceWild(wildCard, replacementCard, grid)) {
      throw new Error('Cannot replace wild card: replacement card does not match');
    }

    // Replace wild card with real card on grid
    grid.addCard(position.x, position.y, replacementCard);

    // Return the wild card (to be added to player's hand)
    return wildCard;
  }

  static getWildValue(card: Card): WildValue | undefined {
    if (!card.isWild) {
      return undefined;
    }
    return card.wildValue;
  }

  static setWildValue(card: Card, value: WildValue): void {
    card.setWildValue(value);
  }

  static determineWildValue(wildCard: Card, lineCards: Card[], _grid: Grid): WildValue | null {
    // Determine wild card value based on line constraints
    // Must satisfy: all same OR all different for each property

    if (lineCards.length < 2) {
      return null;
    }

    const nonWildCards = lineCards.filter((c) => !c.isWild || c !== wildCard);
    if (nonWildCards.length === 0) {
      return null;
    }

    const shapes = nonWildCards.map((c) => c.getEffectiveShape());
    const numbers = nonWildCards.map((c) => c.getEffectiveNumber());
    const colors = nonWildCards.map((c) => c.getEffectiveColor());

    // Check if all same or all different pattern
    const allSameShape = shapes.every((s) => s === shapes[0]);
    const allDifferentShape = new Set(shapes).size === shapes.length;

    const allSameNumber = numbers.every((n) => n === numbers[0]);
    const allDifferentNumber = new Set(numbers).size === numbers.length;

    const allSameColor = colors.every((c) => c === colors[0]);
    const allDifferentColor = new Set(colors).size === colors.length;

    // Determine wild card value
    let wildShape: (typeof shapes)[number];
    let wildNumber: (typeof numbers)[number];
    let wildColor: (typeof colors)[number];

    if (allSameShape) {
      wildShape = shapes[0];
    } else if (allDifferentShape) {
      // Find a shape that's not in the line
      const usedShapes = new Set(shapes);
      const availableShapes = ['Square', 'Triangle', 'Circle', 'Plus'].filter(
        (s) => !usedShapes.has(s as (typeof shapes)[number])
      );
      if (availableShapes.length === 0) {
        return null;
      }
      wildShape = availableShapes[0] as (typeof shapes)[number];
    } else {
      return null;
    }

    if (allSameNumber) {
      wildNumber = numbers[0];
    } else if (allDifferentNumber) {
      const usedNumbers = new Set(numbers);
      const availableNumbers = [1, 2, 3, 4].filter(
        (n) => !usedNumbers.has(n as (typeof numbers)[number])
      );
      if (availableNumbers.length === 0) {
        return null;
      }
      wildNumber = availableNumbers[0] as (typeof numbers)[number];
    } else {
      return null;
    }

    if (allSameColor) {
      wildColor = colors[0];
    } else if (allDifferentColor) {
      const usedColors = new Set(colors);
      const availableColors = ['Red', 'Blue', 'Green', 'Yellow'].filter(
        (c) => !usedColors.has(c as (typeof colors)[number])
      );
      if (availableColors.length === 0) {
        return null;
      }
      wildColor = availableColors[0] as (typeof colors)[number];
    } else {
      return null;
    }

    return {
      shape: wildShape!,
      number: wildNumber!,
      color: wildColor!,
    };
  }
}
