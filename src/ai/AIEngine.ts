import { Card } from '@/game/Card';
import { Grid } from '@/game/Grid';
import { GameState, AIDifficulty } from '@/types/Game.types';
import { Validation, Placement } from '@/game/Validation';
import { Scoring } from '@/game/Scoring';
import { Coordinate, Line } from '@/types/Grid.types';
import { WildValue } from '@/types/Card.types';

export interface AIMove {
  placements: Placement[];
  score: number;
}

const MAX_VALIDATIONS = 2000;

export class AIEngine {
  static findMove(gameState: GameState, difficulty: AIDifficulty): AIMove | null {
    const player = gameState.players[gameState.currentPlayerIndex];
    const hand = player.hand;
    const grid = gameState.grid;

    // 1. Generate all possible moves
    const allMoves = this.generateAllMoves(gameState, hand, grid);

    if (allMoves.length === 0) {
      return null;
    }

    // Sort moves by score descending
    allMoves.sort((a, b) => b.score - a.score);

    const bestScore = allMoves[0].score;

    // 2. Filter based on difficulty
    let targetMoves: AIMove[] = [];
    if (difficulty === 'easy') {
      // 0 to 33% of best score
      targetMoves = allMoves.filter((m) => m.score <= bestScore * 0.33);
    } else if (difficulty === 'medium') {
      // 33% to 66% of best score
      targetMoves = allMoves.filter(
        (m) => m.score > bestScore * 0.33 && m.score <= bestScore * 0.66
      );
    } else {
      // 66% to 100% of best score
      targetMoves = allMoves.filter((m) => m.score > bestScore * 0.66);
    }

    // If target range is empty, pick the closest available
    if (targetMoves.length === 0) {
      if (difficulty === 'easy') targetMoves = [allMoves[allMoves.length - 1]];
      else targetMoves = [allMoves[0]];
    }

    // 3. Special logic for Hard AI: Save wildcard if "good enough" move exists
    if (difficulty === 'hard') {
      const bestMoveWithWildcard = targetMoves.find((m) => m.placements.some((p) => p.card.isWild));
      const bestMoveWithoutWildcard = targetMoves.find(
        (m) => !m.placements.some((p) => p.card.isWild)
      );

      if (bestMoveWithWildcard && bestMoveWithoutWildcard) {
        // If the best move without wildcard is at least 70% of the best move with wildcard, save the wildcard
        if (bestMoveWithoutWildcard.score >= bestMoveWithWildcard.score * 0.7) {
          return bestMoveWithoutWildcard;
        }
      }
    }

    // Randomly pick from targetMoves to add some variety
    return targetMoves[Math.floor(Math.random() * targetMoves.length)];
  }

  private static generateAllMoves(gameState: GameState, hand: Card[], grid: Grid): AIMove[] {
    const validMoves: AIMove[] = [];
    let validationsCount = 0;

    // Find all potential starting points (empty cells adjacent to existing cards)
    const candidates = new Set<string>();
    for (const key of grid.positions.keys()) {
      const [x, y] = key.split(',').map(Number);
      const adj = [
        { x: x + 1, y },
        { x: x - 1, y },
        { x, y: y + 1 },
        { x, y: y - 1 },
      ];
      for (const p of adj) {
        if (!grid.hasCard(p.x, p.y)) {
          candidates.add(`${p.x},${p.y}`);
        }
      }
    }

    const candidatePositions = Array.from(candidates).map((key) => {
      const [x, y] = key.split(',').map(Number);
      return { x, y };
    });

    // Subsets of hand (1 to 4 cards)
    const handSubsets = this.getSubsets(hand);

    for (const subset of handSubsets) {
      const permutations = this.getPermutations(subset);

      for (const perm of permutations) {
        for (const pos of candidatePositions) {
          // Try horizontal and vertical directions
          const directions: ('horizontal' | 'vertical')[] = ['horizontal', 'vertical'];

          for (const dir of directions) {
            // A move can start at 'pos' and go right/down, or it can be centered etc.
            // Simplified: try all offsets so that 'pos' is one of the cards in the line
            for (let offset = 0; offset < perm.length; offset++) {
              if (validationsCount >= MAX_VALIDATIONS) return validMoves;

              const placements: Placement[] = perm.map((card, i) => ({
                card,
                position:
                  dir === 'horizontal'
                    ? { x: pos.x + (i - offset), y: pos.y }
                    : { x: pos.x, y: pos.y + (i - offset) },
              }));

              // Basic sanity check: are these positions empty?
              if (placements.some((p) => grid.hasCard(p.position.x, p.position.y))) continue;

              // Check if it's a valid move (continuous line, etc) via existing Validation
              // We need to handle Wildcards though. If perm has wildcard, we need to find a valid value.
              const result = this.validateAndScore(gameState, placements);
              validationsCount++;

              if (result) {
                validMoves.push(result);
              }
            }
          }
        }
      }
    }

    return validMoves;
  }

  private static validateAndScore(gameState: GameState, placements: Placement[]): AIMove | null {
    // 1. Handle Wildcards: Find a valid value for each wildcard
    const wildcardIndices = placements
      .map((p, i) => (p.card.isWild ? i : -1))
      .filter((i) => i !== -1);

    if (wildcardIndices.length === 0) {
      const validation = Validation.validatePlacement(placements, gameState.grid);
      if (validation.isValid) {
        const score = this.calculateScore(gameState, placements);
        return { placements, score };
      }
      return null;
    }

    // Try finding valid wildcard values
    // For simplicity, if there are multiple wildcards, this is hard. IOTA deck only has 2.
    // If only 1 wildcard:
    if (wildcardIndices.length === 1) {
      const idx = wildcardIndices[0];
      const validValues = this.getValidWildcardValues(
        placements[idx].card,
        placements[idx].position,
        gameState.grid,
        placements.filter((_, i) => i !== idx)
      );

      if (validValues.length > 0) {
        // AI picks the best one? For now, first valid one that gives highest score?
        // Actually, for AI we just need ANY valid move. Score will be calculated with the specific value.
        let bestSubMove: AIMove | null = null;

        for (const val of validValues) {
          const cardWithValue = new Card(val.shape, val.number, val.color, true, val);
          const newPlacements = placements.map((p, i) =>
            i === idx ? { ...p, card: cardWithValue } : p
          );

          const validation = Validation.validatePlacement(newPlacements, gameState.grid);
          if (validation.isValid) {
            const score = this.calculateScore(gameState, newPlacements);
            if (!bestSubMove || score > bestSubMove.score) {
              bestSubMove = { placements: newPlacements, score };
            }
          }
        }
        return bestSubMove;
      }
    }

    return null;
  }

  private static getValidWildcardValues(
    _wildCard: Card,
    position: Coordinate,
    grid: Grid,
    otherPlacements: Placement[]
  ): WildValue[] {
    const validValues: WildValue[] = [];
    const shapes: ('Square' | 'Circle' | 'Triangle' | 'Plus')[] = [
      'Square',
      'Circle',
      'Triangle',
      'Plus',
    ];
    const numbers: (1 | 2 | 3 | 4)[] = [1, 2, 3, 4];
    const colors: ('Red' | 'Blue' | 'Green' | 'Yellow')[] = ['Red', 'Blue', 'Green', 'Yellow'];

    for (const shape of shapes) {
      for (const number of numbers) {
        for (const color of colors) {
          const val: WildValue = { shape, number, color };
          const testCard = new Card(shape, number, color, true, val);
          const currentPlacements = [...otherPlacements, { card: testCard, position }];

          const validation = Validation.validatePlacement(currentPlacements, grid);
          if (validation.isValid) {
            validValues.push(val);
          }
        }
      }
    }
    return validValues;
  }

  private static calculateScore(gameState: GameState, placements: Placement[]): number {
    const grid = gameState.grid;
    // We need to identify ALL lines affected by this placement
    const affectedLines: Line[] = [];
    const processedKeys = new Set<string>();

    for (const p of placements) {
      // Horizontal
      const hLine = Validation.getCompleteLine(p.position, 'horizontal', grid, placements);
      if (hLine) {
        const key = `h-${hLine.positions.map((pos) => `${pos.x},${pos.y}`).join('|')}`;
        if (!processedKeys.has(key)) {
          affectedLines.push(hLine);
          processedKeys.add(key);
        }
      }
      // Vertical
      const vLine = Validation.getCompleteLine(p.position, 'vertical', grid, placements);
      if (vLine) {
        const key = `v-${vLine.positions.map((pos) => `${pos.x},${pos.y}`).join('|')}`;
        if (!processedKeys.has(key)) {
          affectedLines.push(vLine);
          processedKeys.add(key);
        }
      }
    }

    const result = Scoring.calculateTurnScore(
      affectedLines,
      placements.length,
      gameState.isFinalTurn
    );
    return result.finalScore;
  }

  private static getSubsets<T>(array: T[]): T[][] {
    const subsets: T[][] = [];
    for (let i = 1; i < 1 << array.length; i++) {
      const subset: T[] = [];
      for (let j = 0; j < array.length; j++) {
        if ((i >> j) & 1) subset.push(array[j]);
      }
      subsets.push(subset);
    }
    return subsets;
  }

  private static getPermutations<T>(array: T[]): T[][] {
    const results: T[][] = [];
    if (array.length === 1) return [array];

    for (let i = 0; i < array.length; i++) {
      const first = array[i];
      const rest = [...array.slice(0, i), ...array.slice(i + 1)];
      const innerPerms = this.getPermutations(rest);
      for (const inner of innerPerms) {
        results.push([first, ...inner]);
      }
    }
    return results;
  }
}
