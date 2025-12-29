import { useState, useMemo, useCallback } from 'react';
import { Card } from '../Card/Card';
import { Grid } from '@/game/Grid';
import { Validation } from '@/game/Validation';
import { Card as CardClass } from '@/game/Card';
import type { Coordinate } from '@/types/Grid.types';
import type { Card as CardType } from '@/game/Card';
import type { GameSettings } from '@/types/Game.types';
import type { Shape, Number, Color } from '@/types/Card.types';
import styles from './GameBoard.module.css';

interface GameBoardProps {
  grid: Grid;
  onCellClick?: (x: number, y: number) => void;
  selectedCards?: CardType[];
  pendingPlacements?: Array<{ card: CardType; position: Coordinate; wildValue?: import('@/types/Card.types').WildValue }>;
  nextCardIndex?: number;
  onPlaceCard?: (position: Coordinate) => void;
  settings?: GameSettings;
}

export function GameBoard({ 
  grid, 
  onCellClick, 
  selectedCards = [], 
  pendingPlacements = [],
  nextCardIndex = 0,
  onPlaceCard,
  settings
}: GameBoardProps) {
  const [hoveredCell, setHoveredCell] = useState<Coordinate | null>(null);

  // Helper to get complete line (similar to Validation.getCompleteLine but accessible)
  const getCompleteLine = useCallback((
    position: Coordinate,
    direction: 'horizontal' | 'vertical',
    grid: Grid,
    newPlacements: Array<{ card: CardType; position: Coordinate }>
  ): { cards: CardType[]; positions: Coordinate[] } | null => {
    const allCards = new Map<string, CardType>();
    
    // Add existing cards
    for (const [key, card] of grid.positions.entries()) {
      allCards.set(key, card);
    }
    
    // Add new placements
    for (const placement of newPlacements) {
      const key = `${placement.position.x},${placement.position.y}`;
      allCards.set(key, placement.card);
    }
    
    // Get the card at this position (from new placements or grid)
    const positionKey = `${position.x},${position.y}`;
    const cardAtPosition = allCards.get(positionKey);
    
    // If no card at this position, return null
    if (!cardAtPosition) {
      return null;
    }
    
    const positions: Coordinate[] = [position];
    const cards: CardType[] = [cardAtPosition];
    
    if (direction === 'horizontal') {
      // Extend left
      let leftX = position.x - 1;
      while (allCards.has(`${leftX},${position.y}`)) {
        const card = allCards.get(`${leftX},${position.y}`);
        if (card) {
          positions.unshift({ x: leftX, y: position.y });
          cards.unshift(card);
        }
        leftX--;
      }
      
      // Extend right
      let rightX = position.x + 1;
      while (allCards.has(`${rightX},${position.y}`)) {
        const card = allCards.get(`${rightX},${position.y}`);
        if (card) {
          positions.push({ x: rightX, y: position.y });
          cards.push(card);
        }
        rightX++;
      }
    } else {
      // Extend up
      let upY = position.y - 1;
      while (allCards.has(`${position.x},${upY}`)) {
        const card = allCards.get(`${position.x},${upY}`);
        if (card) {
          positions.unshift({ x: position.x, y: upY });
          cards.unshift(card);
        }
        upY--;
      }
      
      // Extend down
      let downY = position.y + 1;
      while (allCards.has(`${position.x},${downY}`)) {
        const card = allCards.get(`${position.x},${downY}`);
        if (card) {
          positions.push({ x: position.x, y: downY });
          cards.push(card);
        }
        downY++;
      }
    }
    
    return { cards, positions };
  }, []);

  // Helper method to check if a wildcard can be placed at a position
  const canPlaceWildcard = useCallback((wildCard: CardType, position: Coordinate, tempGrid: Grid): boolean => {
    // First check if position is valid (adjacent to grid or first card)
    if (tempGrid.positions.size === 0) {
      return true; // First card placement
    }
    
    if (tempGrid.getOccupiedAdjacentCells(position.x, position.y).length === 0) {
      return false; // Not adjacent to any existing cards
    }
    
    // Get all lines this wildcard would be part of (including the wildcard itself)
    const hLine = getCompleteLine(position, 'horizontal', tempGrid, [{ card: wildCard, position }]);
    const vLine = getCompleteLine(position, 'vertical', tempGrid, [{ card: wildCard, position }]);
    
    const lines: Array<{ cards: CardType[]; direction: 'horizontal' | 'vertical' }> = [];
    if (hLine && hLine.cards.length >= 2) {
      lines.push({ cards: hLine.cards, direction: 'horizontal' });
    }
    if (vLine && vLine.cards.length >= 2) {
      lines.push({ cards: vLine.cards, direction: 'vertical' });
    }
    
    // If no lines with 2+ cards, placement is valid (single card or forming new line)
    if (lines.length === 0) {
      return true;
    }
    
    // Try to find a valid wildValue that satisfies all lines
    const shapes: Shape[] = ['Square', 'Circle', 'Triangle', 'Plus'];
    const numbers: Number[] = [1, 2, 3, 4];
    const colors: Color[] = ['Red', 'Blue', 'Green', 'Yellow'];
    
    // Try all combinations
    for (const shape of shapes) {
      for (const number of numbers) {
        for (const color of colors) {
          // Create a test card with this value
          const testCard = new CardClass(shape, number, color, true, { shape, number, color });
          
          // Check if this value works for all lines
          let worksForAllLines = true;
          for (const line of lines) {
            // Replace wildcard in line with test card
            // Filter out any undefined/null cards first, then replace wildcards
            const testLineCards = line.cards
              .filter(c => c !== undefined && c !== null)
              .map(c => {
                // Replace if it's a wildcard without a value (could be the same reference or different)
                if (c && c.isWild && !c.wildValue) {
                  return testCard;
                }
                return c;
              }) as CardType[];
            
            if (testLineCards.length < 2) {
              continue; // Skip lines that become too short
            }
            
            const lineResult = Validation.validateLineRules(testLineCards);
            if (!lineResult.isValid) {
              worksForAllLines = false;
              break;
            }
          }
          
          if (worksForAllLines) {
            return true; // Found a valid value
          }
        }
      }
    }
    
    return false; // No valid value found
  }, [getCompleteLine]);

  // Get grid bounds
  const getBounds = () => {
      // Handle empty grid
      if (!grid || !grid.positions || grid.positions.size === 0) {
        return {
          minX: -3,
          maxX: 3,
          minY: -3,
          maxY: 3,
        };
      }

    let minX = 0, maxX = 0, minY = 0, maxY = 0;
    
    for (const key of grid.positions.keys()) {
      const [x, y] = key.split(',').map(Number);
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }

    // Add padding
    return {
      minX: minX - 3,
      maxX: maxX + 3,
      minY: minY - 3,
      maxY: maxY + 3,
    };
  };

  // Calculate invalid placements when in placement mode and setting is enabled
  const invalidPlacements = useMemo(() => {
    if (!settings?.showInvalidPlacements || selectedCards.length === 0 || nextCardIndex >= selectedCards.length) {
      return new Set<string>();
    }

    const invalid = new Set<string>();
    const nextCard = selectedCards[nextCardIndex];
    const bounds = getBounds();
    
    // Create a temporary grid with pending placements
    const tempGrid = new Grid();
    for (const [key, card] of grid.positions.entries()) {
      const [x, y] = key.split(',').map(Number);
      tempGrid.addCard(x, y, card);
    }
    for (const placement of pendingPlacements) {
      tempGrid.addCard(placement.position.x, placement.position.y, placement.card);
    }

    // Check each empty cell in visible bounds
    for (let y = bounds.minY; y <= bounds.maxY; y++) {
      for (let x = bounds.minX; x <= bounds.maxX; x++) {
        if (tempGrid.hasCard(x, y)) continue; // Skip occupied cells
        
        // For wildcards, check if ANY value assignment would make it valid
        let isValid = false;
        if (nextCard.isWild && !nextCard.wildValue) {
          isValid = canPlaceWildcard(nextCard, { x, y }, tempGrid);
        } else {
          // For regular cards or wildcards with values, use normal validation
          const result = Validation.validatePlacement(
            [{ card: nextCard, position: { x, y } }],
            tempGrid
          );
          isValid = result.isValid;
        }
        
        if (!isValid) {
          invalid.add(`${x},${y}`);
        }
      }
    }

    return invalid;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid, selectedCards, nextCardIndex, pendingPlacements, settings?.showInvalidPlacements, canPlaceWildcard, getCompleteLine]);

  const bounds = getBounds();
  const width = bounds.maxX - bounds.minX + 1;
  const height = bounds.maxY - bounds.minY + 1;

  const handleCellClick = (x: number, y: number, hasCard: boolean) => {
    // Don't allow placing on occupied cells
    if (hasCard) {
      return;
    }

    // Only allow placing if we have selected cards and haven't placed all yet
    if (selectedCards.length > 0 && nextCardIndex < selectedCards.length && onPlaceCard) {
      // Check if this position is already used in pending placements
      const isAlreadyPlaced = pendingPlacements.some(p => 
        p.position.x === x && p.position.y === y
      );
      if (!isAlreadyPlaced) {
        onPlaceCard({ x, y });
      }
    }
    onCellClick?.(x, y);
  };

  const cells: JSX.Element[] = [];
  
  for (let y = bounds.minY; y <= bounds.maxY; y++) {
    for (let x = bounds.minX; x <= bounds.maxX; x++) {
      const card = grid.getCard(x, y);
      const isHovered = hoveredCell?.x === x && hoveredCell?.y === y;
      const hasCard = card !== undefined;
      const starterPosition = grid.getStarterPosition();
      const isStarter = starterPosition?.x === x && starterPosition?.y === y;
      
      // Check if this position has a pending placement
      const pendingPlacement = pendingPlacements.find(p => 
        p.position.x === x && p.position.y === y
      );
      const showPendingCard = pendingPlacement && !hasCard;
      
      // Show preview card if in preview mode
      // If it's a wildcard with a selected value, show the card with that value
      let displayCard = card;
      if (showPendingCard && pendingPlacement) {
        if (pendingPlacement.card.isWild && pendingPlacement.wildValue) {
          // Create a card with the selected wildcard value
          displayCard = new CardClass(
            pendingPlacement.wildValue.shape,
            pendingPlacement.wildValue.number,
            pendingPlacement.wildValue.color,
            false // Not a wildcard anymore, it's been replaced
          );
        } else {
          displayCard = pendingPlacement.card;
        }
      }
      const isPreview = showPendingCard && !hasCard;
      
      // Determine if this cell is clickable for placement
      const isPlacementMode = selectedCards.length > 0 && nextCardIndex < selectedCards.length;
      const isClickable = !hasCard && isPlacementMode && !pendingPlacements.some(p => p.position.x === x && p.position.y === y);
      const isNotAllowed = hasCard && isPlacementMode;
      const isInvalidPlacement = !hasCard && isPlacementMode && invalidPlacements.has(`${x},${y}`);
      
      // Determine cursor for card
      let cardCursor: 'pointer' | 'not-allowed' | undefined;
      if (isNotAllowed || isInvalidPlacement) {
        cardCursor = 'not-allowed';
      } else if (isClickable) {
        cardCursor = 'pointer';
      }
      
      cells.push(
        <div
          key={`${x},${y}`}
          className={`${styles.cell} ${hasCard ? styles.occupied : ''} ${isHovered ? styles.hovered : ''} ${isStarter ? styles.starter : ''} ${isPreview ? styles.preview : ''} ${isNotAllowed ? styles.notAllowed : ''} ${isInvalidPlacement ? styles.invalidPlacement : ''}`}
          onClick={() => handleCellClick(x, y, hasCard)}
          onMouseEnter={() => setHoveredCell({ x, y })}
          onMouseLeave={() => setHoveredCell(null)}
        >
          {displayCard && <Card card={displayCard} cursor={cardCursor} />}
        </div>
      );
    }
  }

  return (
    <div className={styles.gameBoard}>
      <div
        className={styles.grid}
        style={{
          gridTemplateColumns: `repeat(${width}, 64px)`,
          gridTemplateRows: `repeat(${height}, 64px)`,
        }}
      >
        {cells}
      </div>
    </div>
  );
}

