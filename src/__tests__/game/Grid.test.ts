import { describe, it, expect } from 'vitest';
import { Grid } from '@/game/Grid';
import { Card } from '@/game/Card';
import type { Coordinate } from '@/types/Grid.types';

describe('Grid', () => {
  it('should create an empty grid', () => {
    const grid = new Grid();
    expect(grid.getAllLines().length).toBe(0);
  });

  it('should place a starter card', () => {
    const grid = new Grid();
    const card = new Card('Square', 1, 'Red');
    grid.setStarterCard(0, 0, card);
    
    const starterCard = grid.getStarterCard();
    expect(starterCard).toEqual(card);
  });

  it('should add a card at coordinates', () => {
    const grid = new Grid();
    const card = new Card('Square', 1, 'Red');
    grid.setStarterCard(0, 0, card);
    grid.addCard(1, 0, new Card('Square', 2, 'Red'));
    
    const lines = grid.getAllLines();
    expect(lines.length).toBeGreaterThan(0);
  });

  it('should detect horizontal lines', () => {
    const grid = new Grid();
    grid.setStarterCard(0, 0, new Card('Square', 1, 'Red'));
    grid.addCard(1, 0, new Card('Square', 2, 'Red'));
    
    const lines = grid.getAllLines();
    const horizontalLine = lines.find(line => line.direction === 'horizontal');
    expect(horizontalLine).toBeDefined();
  });

  it('should detect vertical lines', () => {
    const grid = new Grid();
    grid.setStarterCard(0, 0, new Card('Square', 1, 'Red'));
    grid.addCard(0, 1, new Card('Square', 2, 'Red'));
    
    const lines = grid.getAllLines();
    const verticalLine = lines.find(line => line.direction === 'vertical');
    expect(verticalLine).toBeDefined();
  });

  it('should get adjacent cells', () => {
    const grid = new Grid();
    grid.setStarterCard(0, 0, new Card('Square', 1, 'Red'));
    
    const adjacent = grid.getAdjacentCells(0, 0);
    expect(adjacent.length).toBeGreaterThan(0);
    expect(adjacent.some(cell => cell.x === 1 && cell.y === 0)).toBe(true);
    expect(adjacent.some(cell => cell.x === 0 && cell.y === 1)).toBe(true);
  });

  it('should validate continuous vertical line', () => {
    const grid = new Grid();
    const positions: Coordinate[] = [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
    ];
    
    expect(grid.isContinuousLine(positions)).toBe(true);
  });

  it('should validate continuous horizontal line', () => {
    const grid = new Grid();
    const positions: Coordinate[] = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ];
    
    expect(grid.isContinuousLine(positions)).toBe(true);
  });

  it('should detect non-continuous line', () => {
    const grid = new Grid();
    const positions: Coordinate[] = [
      { x: 0, y: 0 },
      { x: 2, y: 0 }, // Gap at x: 1
    ];
    
    expect(grid.isContinuousLine(positions)).toBe(false);
  });

  it('should get line containing position', () => {
    const grid = new Grid();
    grid.setStarterCard(0, 0, new Card('Square', 1, 'Red'));
    grid.addCard(1, 0, new Card('Square', 2, 'Red'));
    
    const line = grid.getLine(0, 0, 'horizontal');
    expect(line).toBeDefined();
    expect(line?.cards.length).toBe(2);
  });

  it('should return null for line not containing position', () => {
    const grid = new Grid();
    grid.setStarterCard(0, 0, new Card('Square', 1, 'Red'));
    
    const line = grid.getLine(5, 5, 'horizontal');
    expect(line).toBeNull();
  });
});

