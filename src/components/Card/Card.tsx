import { useTheme } from '@/context/ThemeContext';
import { ColorUtils } from '@/utils/colors';
import styles from './Card.module.css';
import type { Card as CardType } from '@/game/Card';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}

export function Card({ card, onClick, selected, className = '' }: CardProps) {
  const { settings } = useTheme();
  const colorStyle = ColorUtils.getGradient(card.color, settings.useGradients);

  const shapeSymbol = getShapeSymbol(card.getEffectiveShape());
  const numberDisplay = card.getEffectiveNumber();
  const isWild = card.isWild;

  return (
    <div
      className={`${styles.card} ${selected ? styles.selected : ''} ${className}`}
      onClick={onClick}
      style={{
        background: colorStyle,
        color: getContrastColor(card.getEffectiveColor()),
      }}
    >
      {isWild && <div className={styles.wildBadge}>WILD</div>}
      <div className={styles.shape}>{shapeSymbol}</div>
      <div className={styles.number}>{numberDisplay}</div>
    </div>
  );
}

function getShapeSymbol(shape: string): string {
  switch (shape) {
    case 'Square':
      return '■';
    case 'Triangle':
      return '▲';
    case 'Circle':
      return '●';
    case 'Plus':
      return '+';
    default:
      return '?';
  }
}

function getContrastColor(color: string): string {
  // Return white or black based on color for contrast
  if (color === 'Yellow' || color === 'Green') {
    return '#000000';
  }
  return '#FFFFFF';
}

