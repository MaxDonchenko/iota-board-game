import { useSettings } from '@/context/SettingsContext';
import { ColorUtils } from '@/utils/colors';
import styles from './Card.module.css';
import type { Card as CardType } from '@/game/Card';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
  cursor?: 'pointer' | 'not-allowed' | 'default';
  wildcardVariant?: 'modern' | 'original';
  cardVariant?: 'modern' | 'original';
  dataTestId?: string;
}

export function Card({
  card,
  onClick,
  selected,
  className = '',
  cursor,
  wildcardVariant,
  cardVariant,
  dataTestId,
}: CardProps) {
  const { settings: contextSettings } = useSettings();
  const settings = {
    ...contextSettings,
    ...(wildcardVariant && { wildcardVariant }),
    ...(cardVariant && { cardVariant }),
  };
  const isWild = card.isWild;
  const hasWildValue = isWild && card.wildValue;

  // For wildcards without values, show variant-specific design
  if (isWild && !hasWildValue) {
    if (settings.wildcardVariant === 'original') {
      return (
        <div
          className={`${styles.card} ${styles.wildCard} ${styles.wildCardV2} ${
            selected ? styles.selected : ''
          } ${className}`}
          onClick={onClick}
          data-testid={dataTestId}
          style={{
            cursor: cursor || (onClick ? 'pointer' : undefined),
          }}
        >
          <div className={styles.wildGridV2}>
            {(() => {
              const cornerColor =
                settings.theme === 'dark' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)';
              return (
                <>
                  <div
                    className={styles.wildCellV2}
                    style={{ backgroundColor: ColorUtils.toHex('Yellow', settings.theme) }}
                  >
                    <div className={styles.wildShape} style={{ color: cornerColor }}>
                      ■
                    </div>
                  </div>
                  <div
                    className={styles.wildCellV2}
                    style={{ backgroundColor: ColorUtils.toHex('Red', settings.theme) }}
                  >
                    <div className={styles.wildShape} style={{ color: cornerColor }}>
                      ●
                    </div>
                  </div>
                  <div
                    className={styles.wildCellV2}
                    style={{ backgroundColor: ColorUtils.toHex('Blue', settings.theme) }}
                  >
                    <div className={styles.wildShape} style={{ color: cornerColor }}>
                      {getPlusSVG(16, cornerColor)}
                    </div>
                  </div>
                  <div
                    className={styles.wildCellV2}
                    style={{ backgroundColor: ColorUtils.toHex('Green', settings.theme) }}
                  >
                    <div className={styles.wildShape} style={{ color: cornerColor }}>
                      ▲
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
          <div className={styles.cobweb}>
            {(() => {
              const shapes = ['Square', 'Circle', 'Plus', 'Triangle'];
              const cobwebColor =
                settings.theme === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)';

              return (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gridTemplateRows: 'repeat(4, 1fr)',
                    gap: '2px',
                    padding: '8px',
                    zIndex: 2,
                    pointerEvents: 'none',
                  }}
                >
                  {Array.from({ length: 16 }, (_, i) => {
                    const row = Math.floor(i / 4);
                    const col = i % 4;
                    const shapeIndex = (row + col) % 4;
                    const shape = shapes[shapeIndex];

                    return (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '6px',
                          color: cobwebColor,
                          fontWeight: 'bold',
                        }}
                      >
                        {shape === 'Square' && '■'}
                        {shape === 'Circle' && '●'}
                        {shape === 'Plus' && getPlusSVG(8, cobwebColor)}
                        {shape === 'Triangle' && '▲'}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      );
    }

    // modern - grid style
    return (
      <div
        className={`${styles.card} ${styles.wildCard} ${
          selected ? styles.selected : ''
        } ${className}`}
        onClick={onClick}
        data-testid={dataTestId}
        style={{
          cursor: cursor || (onClick ? 'pointer' : undefined),
        }}
      >
        <div className={styles.wildGrid}>
          <div
            className={styles.wildCell}
            style={{ backgroundColor: ColorUtils.toHex('Yellow', settings.theme) }}
          >
            ■
          </div>
          <div
            className={styles.wildCell}
            style={{ backgroundColor: ColorUtils.toHex('Red', settings.theme) }}
          >
            ●
          </div>
          <div
            className={styles.wildCell}
            style={{ backgroundColor: ColorUtils.toHex('Blue', settings.theme) }}
          >
            +
          </div>
          <div
            className={styles.wildCell}
            style={{ backgroundColor: ColorUtils.toHex('Green', settings.theme) }}
          >
            ▲
          </div>
        </div>
      </div>
    );
  }

  // Regular card or wildcard with value
  const effectiveShape = card.getEffectiveShape()!;
  const effectiveNumber = card.getEffectiveNumber()!;
  const effectiveColor = card.getEffectiveColor()!;

  const colorStyle = ColorUtils.getGradient(effectiveColor, settings.useGradients, settings.theme);
  const shapeSymbol = getShapeSymbol(effectiveShape);
  const numberDisplay = effectiveNumber;
  const cardColor = ColorUtils.toHex(effectiveColor, settings.theme);

  // Dark mode: black text, Light mode: white text
  const textColor = settings.theme === 'dark' ? '#000000' : '#FFFFFF';
  const oppositeColor = settings.theme === 'dark' ? '#FFFFFF' : '#000000';

  // Card original: squared background with full-size shape and tiny shapes inside
  if (settings.cardVariant === 'original') {
    return (
      <div
        className={`${styles.card} ${styles.cardV2} ${
          selected ? styles.selected : ''
        } ${className}`}
        onClick={onClick}
        data-testid={dataTestId}
        style={{
          backgroundColor: textColor,
          cursor: cursor || (onClick ? 'pointer' : undefined),
        }}
      >
        {isWild && <div className={styles.wildBadge}>WILD</div>}
        <div className={styles.shapeV2} style={{ color: cardColor }}>
          {effectiveShape === 'Plus' ? getPlusSVG(48, cardColor) : shapeSymbol}
        </div>
        <div className={styles.tinyShapes} data-count={numberDisplay}>
          {Array.from({ length: numberDisplay }, (_, i) => (
            <div key={i} className={styles.tinyShape} style={{ color: oppositeColor }}>
              {effectiveShape === 'Plus' ? getPlusSVG(10, oppositeColor) : shapeSymbol}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Card modern: gradient design
  return (
    <div
      className={`${styles.card} ${selected ? styles.selected : ''} ${className}`}
      onClick={onClick}
      data-testid={dataTestId}
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

function getPlusSVG(size: number, color: string) {
  const cutoutSize = Math.floor(size / 3); // Make cutouts slightly bigger (1-2px)

  // Create plus shape path: square with 4 corner cutouts
  // This path will have shadows applied to its perimeter, not the bounding box
  const path = `M ${cutoutSize} 0 L ${size - cutoutSize} 0 L ${
    size - cutoutSize
  } ${cutoutSize} L ${size} ${cutoutSize} L ${size} ${size - cutoutSize} L ${size - cutoutSize} ${
    size - cutoutSize
  } L ${size - cutoutSize} ${size} L ${cutoutSize} ${size} L ${cutoutSize} ${
    size - cutoutSize
  } L 0 ${size - cutoutSize} L 0 ${cutoutSize} L ${cutoutSize} ${cutoutSize} Z`;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Use path directly so shadows apply to plus perimeter */}
      <path d={path} fill={color} />
    </svg>
  );
}
