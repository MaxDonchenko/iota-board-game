import { useState } from 'react';
import { Card } from '../Card/Card';
import { Grid } from '@/game/Grid';
import type { Coordinate } from '@/types/Grid.types';
import type { Card as CardType } from '@/game/Card';
import styles from './GameBoard.module.css';

interface GameBoardProps {
  grid: Grid;
  onCellClick?: (x: number, y: number) => void;
  selectedCards?: CardType[];
  onPlaceCard?: (card: CardType, position: Coordinate) => void;
}

export function GameBoard({ grid, onCellClick, selectedCards = [], onPlaceCard }: GameBoardProps) {
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

  const bounds = getBounds();
  const width = bounds.maxX - bounds.minX + 1;
  const height = bounds.maxY - bounds.minY + 1;

  const handleCellClick = (x: number, y: number) => {
    if (selectedCards.length > 0 && onPlaceCard) {
      const card = selectedCards[0];
      onPlaceCard(card, { x, y });
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
      
      cells.push(
        <div
          key={`${x},${y}`}
          className={`${styles.cell} ${hasCard ? styles.occupied : ''} ${isHovered ? styles.hovered : ''} ${isStarter ? styles.starter : ''}`}
          onClick={() => handleCellClick(x, y)}
          onMouseEnter={() => setHoveredCell({ x, y })}
          onMouseLeave={() => setHoveredCell(null)}
        >
          {card && <Card card={card} />}
        </div>
      );
    }
  }

  return (
    <div className={styles.gameBoard}>
      <div
        className={styles.grid}
        style={{
          gridTemplateColumns: `repeat(${width}, 1fr)`,
          gridTemplateRows: `repeat(${height}, 1fr)`,
        }}
      >
        {cells}
      </div>
    </div>
  );
}

