import { Card } from '../Card/Card';
import type { Card as CardType } from '@/game/Card';
import styles from './PlayerHand.module.css';

interface PlayerHandProps {
  cards: CardType[];
  onCardSelect?: (card: CardType) => void;
  maxSelection?: number;
  selectedCards?: CardType[];
  onSelectionChange?: (selected: CardType[]) => void;
}

export function PlayerHand({ 
  cards, 
  onCardSelect, 
  maxSelection = 4,
  selectedCards = [],
  onSelectionChange
}: PlayerHandProps) {
  const isSelected = (card: CardType) => selectedCards.includes(card);

  const handleCardClick = (card: CardType) => {
    if (isSelected(card)) {
      // Deselect
      const newSelection = selectedCards.filter(c => c !== card);
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
      <h3 className={styles.title}>Your Hand</h3>
      <div className={styles.cards}>
        {cards.map((card, index) => (
          <Card
            key={index}
            card={card}
            onClick={() => handleCardClick(card)}
            selected={isSelected(card)}
          />
        ))}
      </div>
      {selectedCards.length > 0 && (
        <div className={styles.selectionInfo}>
          {selectedCards.length} card{selectedCards.length !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
}

