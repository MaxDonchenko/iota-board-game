import { Card } from './Card';
import { LOT_MULTIPLIER, ALL_FOUR_MULTIPLIER, FINAL_TURN_MULTIPLIER } from './constants';
import type { Line } from '@/types/Grid.types';

export interface ScoreResult {
  baseScore: number;
  lots: number;
  playedAllFour: boolean;
  isFinalTurn: boolean;
  finalScore: number;
}

export class Scoring {
  static getCardValue(card: Card): number {
    return card.getValue();
  }

  static calculateTurnScore(
    lines: Line[],
    cardsPlayed: number,
    isFinalTurn: boolean
  ): ScoreResult {
    // Calculate base score: sum of card values in each line
    let baseScore = 0;
    for (const line of lines) {
      const lineScore = line.cards.reduce((sum, card) => sum + this.getCardValue(card), 0);
      baseScore += lineScore;
    }

    // Detect lots (4-card lines)
    const lots = this.detectLots(lines);

    // Check if all 4 cards were played
    const playedAllFour = cardsPlayed === 4;

    // Apply doubling
    const finalScore = this.applyDoubling(baseScore, lots, playedAllFour, isFinalTurn);

    return {
      baseScore,
      lots,
      playedAllFour,
      isFinalTurn,
      finalScore,
    };
  }

  static detectLots(lines: Line[]): number {
    return lines.filter(line => line.cards.length === 4).length;
  }

  static applyDoubling(
    baseScore: number,
    lots: number,
    playedAllFour: boolean,
    isFinalTurn: boolean
  ): number {
    let score = baseScore;

    // Double for each lot
    for (let i = 0; i < lots; i++) {
      score *= LOT_MULTIPLIER;
    }

    // Double again if all 4 cards played
    if (playedAllFour) {
      score *= ALL_FOUR_MULTIPLIER;
    }

    // Double for final turn
    if (isFinalTurn) {
      score *= FINAL_TURN_MULTIPLIER;
    }

    return score;
  }

  static calculateLineScore(line: Line): number {
    return line.cards.reduce((sum, card) => sum + this.getCardValue(card), 0);
  }
}

