import type { GameState } from '@/types/Game.types';
import styles from './GameOverview.module.css';

interface GameOverviewProps {
  gameState: GameState;
  gameStartTime?: Date;
}

export function GameOverview({ gameState, gameStartTime }: GameOverviewProps) {
  const cardsPlayed = gameState.grid.positions.size;
  const cardsInDeck = gameState.deck.drawPile.length;
  const totalCards = gameState.gameMode === 'full' ? 64 + 8 : 32 + 4; // cards + wildcards
  
  const formatDuration = (startTime?: Date) => {
    if (!startTime) return 'N/A';
    const now = new Date();
    const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000);
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.overview}>
      <div className={styles.stat}>
        <span className={styles.label}>Cards Played:</span>
        <span className={styles.value}>{cardsPlayed}</span>
      </div>
      <div className={styles.stat}>
        <span className={styles.label}>Deck:</span>
        <span className={styles.value}>{cardsInDeck}</span>
      </div>
      <div className={styles.stat}>
        <span className={styles.label}>Duration:</span>
        <span className={styles.value}>{formatDuration(gameStartTime)}</span>
      </div>
    </div>
  );
}

