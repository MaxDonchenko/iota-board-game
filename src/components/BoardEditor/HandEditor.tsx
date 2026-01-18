import { Card } from '@/game/Card';
import { PlayerHand } from '@/components/PlayerHand/PlayerHand';
import styles from './BoardEditor.module.css';
import type { Player } from '@/types/Game.types';

interface HandEditorProps {
  players: Player[];
  onUpdateHand: (playerIndex: number, cards: Card[]) => void;
  selectedEditorCard: Card | null;
}

export function HandEditor({ players, onUpdateHand, selectedEditorCard }: HandEditorProps) {
  return (
    <div className={styles.handEditor}>
      <h3>Players Hands</h3>
      {players.map((player, i) => (
        <div key={player.id} className={styles.playerHand}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem',
            }}
          >
            <span style={{ fontWeight: 'bold', color: player.color }}>{player.name}</span>
            {player.hand.length < 4 && (
              <button
                className={styles.secondaryButton}
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}
                onClick={() => {
                  if (selectedEditorCard) {
                    onUpdateHand(i, [...player.hand, selectedEditorCard]);
                  } else {
                    alert('Select a card from the picker first to add it to the hand');
                  }
                }}
              >
                Add Selected
              </button>
            )}
          </div>
          <PlayerHand
            cards={player.hand}
            onSelectionChange={(selected) => {
              // When a card is "selected" in this mode, we actually remove it from hand
              // This is a simple way to edit the hand: Click to add from picker, click in hand to remove
              const newHand = player.hand.filter((c) => !selected.includes(c));
              onUpdateHand(i, newHand);
            }}
          />
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Click a card in hand to remove it.
          </div>
        </div>
      ))}
    </div>
  );
}
