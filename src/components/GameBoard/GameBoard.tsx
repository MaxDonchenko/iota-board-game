import { useState, useMemo } from 'react';
import { Card } from '../Card/Card';
import { Grid } from '@/game/Grid';
import { Validation } from '@/game/Validation';
import type { Coordinate } from '@/types/Grid.types';
import type { Card as CardType } from '@/game/Card';
import type { GameSettings } from '@/types/Game.types';
import styles from './GameBoard.module.css';

interface GameBoardProps {
  grid: Grid;
  onCellClick?: (x: number, y: number) => void;
  selectedCards?: CardType[];
  pendingPlacements?: Array<{ card: CardType; position: Coordinate }>;
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

  // Get grid bounds
  const getBounds = () => {
    // Handle empty grid
    if (!grid || !grid.positions || grid.positions.size === 0) {
      return {
        minX: -2,
        maxX: 2,
        minY: -2,
        maxY: 2,
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
      minX: minX - 2,
      maxX: maxX + 2,
      minY: minY - 2,
      maxY: maxY + 2,
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
        
        // Check if placing the next card here would be valid
        const result = Validation.validatePlacement(
          [{ card: nextCard, position: { x, y } }],
          tempGrid
        );
        
        if (!result.isValid) {
          invalid.add(`${x},${y}`);
        }
      }
    }

    return invalid;
  }, [grid, selectedCards, nextCardIndex, pendingPlacements, settings?.showInvalidPlacements]);

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
      const displayCard = card || (showPendingCard ? pendingPlacement?.card : undefined);
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

