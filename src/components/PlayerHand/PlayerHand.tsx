import { Card } from '../Card/Card';
import classNames from 'classnames';
import type { Card as CardType } from '@/game/Card';
import styles from './PlayerHand.module.css';

interface PlayerHandProps {
  cards: CardType[];
  maxSelection?: number;
  selectedCards?: CardType[];
  onSelectionChange?: (selected: CardType[]) => void;
  onResetSelection?: () => void;
  disabled?: boolean;
}

export function PlayerHand({
  cards,
  maxSelection = 4,
  selectedCards = [],
  onSelectionChange,
  onResetSelection,
  disabled = false,
}: PlayerHandProps) {
  const isSelected = (card: CardType) => selectedCards.includes(card);

  const handleCardClick = (card: CardType) => {
    if (disabled) return;
    if (isSelected(card)) {
      // Deselect
      const newSelection = selectedCards.filter((c) => c !== card);
      onSelectionChange?.(newSelection);
    } else {
      // Select (if under max)
      if (selectedCards.length < maxSelection) {
        const newSelection = [...selectedCards, card];
        onSelectionChange?.(newSelection);
      }
    }
  };

  return (
    <div className={classNames(styles.hand, { [styles.disabled]: disabled })}>
      <div className={styles.cards}>
        {cards.map((card, index) => (
          <Card
            key={index}
            card={card}
            onClick={() => handleCardClick(card)}
            selected={isSelected(card)}
            dataTestId={`hand-card-${index}`}
          />
        ))}
      </div>
      <div
        className={styles.selectionInfo}
        style={{ visibility: selectedCards.length > 0 ? 'visible' : 'hidden' }}
      >
        <span>
          {selectedCards.length} card{selectedCards.length !== 1 ? 's' : ''} selected
        </span>
        {onResetSelection && (
          <button
            onClick={onResetSelection}
            className={styles.resetButton}
            style={{ marginLeft: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
            disabled={disabled}
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
