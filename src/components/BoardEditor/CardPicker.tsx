import { Card } from '@/game/Card';
import { Card as CardComponent } from '@/components/Card/Card';
import styles from './BoardEditor.module.css';

interface CardPickerProps {
  cards: Card[];
  selectedCard: Card | null;
  onSelect: (card: Card) => void;
}

export function CardPicker({ cards, selectedCard, onSelect }: CardPickerProps) {
  return (
    <div className={styles.cardPicker}>
      <h3>Pick a Card</h3>
      <div className={styles.cardGrid}>
        {cards.map((card, i) => (
          <div
            key={i}
            className={`${styles.cardWrapper} ${selectedCard?.equals(card) ? styles.selected : ''}`}
            onClick={() => onSelect(card)}
          >
            <CardComponent card={card} />
          </div>
        ))}
      </div>
    </div>
  );
}
