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
  wildcardVariant?: 'v1' | 'v2';
}

export function Card({ card, onClick, selected, className = '', cursor, wildcardVariant }: CardProps) {
  const { settings: contextSettings } = useTheme();
  const settings = wildcardVariant ? { ...contextSettings, wildcardVariant } : contextSettings;
  const isWild = card.isWild;
  const hasWildValue = isWild && card.wildValue;

  // For wildcards without values, show variant-specific design
  if (isWild && !hasWildValue) {
    if (settings.wildcardVariant === 'v2') {
      return (
        <div
          className={`${styles.card} ${styles.wildCard} ${styles.wildCardV2} ${selected ? styles.selected : ''} ${className}`}
          onClick={onClick}
          style={{
            cursor: cursor || (onClick ? 'pointer' : undefined),
          }}
        >
          <div className={styles.wildGridV2}>
            <div className={styles.wildCellV2} style={{ backgroundColor: ColorUtils.toHex('Yellow', settings.theme) }}>
              <div className={styles.wildShape}>■</div>
            </div>
            <div className={styles.wildCellV2} style={{ backgroundColor: ColorUtils.toHex('Red', settings.theme) }}>
              <div className={styles.wildShape}>●</div>
            </div>
            <div className={styles.wildCellV2} style={{ backgroundColor: ColorUtils.toHex('Blue', settings.theme) }}>
              <div className={styles.wildShape}>+</div>
            </div>
            <div className={styles.wildCellV2} style={{ backgroundColor: ColorUtils.toHex('Green', settings.theme) }}>
              <div className={styles.wildShape}>▲</div>
            </div>
          </div>
          <div className={styles.cobweb} style={{ color: settings.theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)' }}>
            <svg width="100%" height="100%" viewBox="0 0 60 60" style={{ position: 'absolute', top: 0, left: 0 }}>
              <circle cx="30" cy="30" r="2" fill="currentColor" />
              <circle cx="15" cy="15" r="1.5" fill="currentColor" />
              <circle cx="45" cy="15" r="1.5" fill="currentColor" />
              <circle cx="15" cy="45" r="1.5" fill="currentColor" />
              <circle cx="45" cy="45" r="1.5" fill="currentColor" />
              <line x1="30" y1="30" x2="15" y2="15" stroke="currentColor" strokeWidth="0.5" />
              <line x1="30" y1="30" x2="45" y2="15" stroke="currentColor" strokeWidth="0.5" />
              <line x1="30" y1="30" x2="15" y2="45" stroke="currentColor" strokeWidth="0.5" />
              <line x1="30" y1="30" x2="45" y2="45" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="22" cy="22" r="1" fill="currentColor" />
              <circle cx="38" cy="22" r="1" fill="currentColor" />
              <circle cx="22" cy="38" r="1" fill="currentColor" />
              <circle cx="38" cy="38" r="1" fill="currentColor" />
            </svg>
          </div>
        </div>
      );
    }
    
    // v1 - original grid
    return (
      <div
        className={`${styles.card} ${styles.wildCard} ${selected ? styles.selected : ''} ${className}`}
        onClick={onClick}
        style={{
          cursor: cursor || (onClick ? 'pointer' : undefined),
        }}
      >
        <div className={styles.wildGrid}>
          <div className={styles.wildCell} style={{ backgroundColor: ColorUtils.toHex('Yellow', settings.theme) }}>■</div>
          <div className={styles.wildCell} style={{ backgroundColor: ColorUtils.toHex('Red', settings.theme) }}>●</div>
          <div className={styles.wildCell} style={{ backgroundColor: ColorUtils.toHex('Blue', settings.theme) }}>+</div>
          <div className={styles.wildCell} style={{ backgroundColor: ColorUtils.toHex('Green', settings.theme) }}>▲</div>
        </div>
      </div>
    );
  }

  // Regular card or wildcard with value
  const colorStyle = ColorUtils.getGradient(card.color, settings.useGradients, settings.theme);
  const shapeSymbol = getShapeSymbol(card.getEffectiveShape());
  const numberDisplay = card.getEffectiveNumber();

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
    case 'Circle':
      return '●';
    case 'Plus':
      return '+';
      case 'Triangle':
        return '▲';
    default:
      return '?';
  }
}

