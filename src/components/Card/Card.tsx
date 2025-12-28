import { useTheme } from '@/context/ThemeContext';
import { ColorUtils } from '@/utils/colors';
import styles from './Card.module.css';
import type { Card as CardType } from '@/game/Card';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
  cursor?: 'pointer' | 'not-allowed' | 'default';
}

export function Card({ card, onClick, selected, className = '', cursor }: CardProps) {
  const { settings } = useTheme();
  const colorStyle = ColorUtils.getGradient(card.color, settings.useGradients, settings.theme);

  const shapeSymbol = getShapeSymbol(card.getEffectiveShape());
  const numberDisplay = card.getEffectiveNumber();
  const isWild = card.isWild;

  // Dark mode: black text, Light mode: white text
  const textColor = settings.theme === 'dark' ? '#000000' : '#FFFFFF';

  return (
    <div
      className={`${styles.card} ${selected ? styles.selected : ''} ${className}`}
      onClick={onClick}
      style={{
        background: colorStyle,
        color: textColor,
        cursor: cursor || (onClick ? 'pointer' : undefined),
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

