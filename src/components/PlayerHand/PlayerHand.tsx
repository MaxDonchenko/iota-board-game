import { Card } from '../Card/Card';
import { useCardSelection } from '@/hooks/useCardSelection';
import type { Card as CardType } from '@/game/Card';
import styles from './PlayerHand.module.css';

interface PlayerHandProps {
  cards: CardType[];
  onCardSelect?: (card: CardType) => void;
  maxSelection?: number;
}

export function PlayerHand({ cards, onCardSelect, maxSelection = 4 }: PlayerHandProps) {
  const { selectedCards, selectCard, deselectCard, isSelected } = useCardSelection(maxSelection);

  const handleCardClick = (card: CardType) => {
    if (isSelected(card)) {
      deselectCard(card);
    } else {
      selectCard(card);
    }
    onCardSelect?.(card);
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

