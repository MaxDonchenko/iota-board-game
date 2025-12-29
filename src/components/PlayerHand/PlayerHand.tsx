import { Card } from '../Card/Card';
import type { Card as CardType } from '@/game/Card';
import styles from './PlayerHand.module.css';

interface PlayerHandProps {
  cards: CardType[];
  onCardSelect?: (card: CardType) => void;
  maxSelection?: number;
  selectedCards?: CardType[];
  onSelectionChange?: (selected: CardType[]) => void;
  onResetSelection?: () => void;
}

export function PlayerHand({
  cards,
  onCardSelect,
  maxSelection = 4,
  selectedCards = [],
  onSelectionChange,
  onResetSelection,
}: PlayerHandProps) {
  const isSelected = (card: CardType) => selectedCards.includes(card);

  const handleCardClick = (card: CardType) => {
    if (isSelected(card)) {
      // Deselect
      const newSelection = selectedCards.filter((c) => c !== card);
      onSelectionChange?.(newSelection);
      onCardSelect?.(card);
    } else {
      // Select (if under max)
      if (selectedCards.length < maxSelection) {
        const newSelection = [...selectedCards, card];
        onSelectionChange?.(newSelection);
        onCardSelect?.(card);
      }
    }
  };

  return (
    <div className={styles.hand}>
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
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
