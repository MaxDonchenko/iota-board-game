import type { GameState } from '@/types/Game.types';
import styles from './ScoreDisplay.module.css';

interface ScoreDisplayProps {
  gameState: GameState;
}

export function ScoreDisplay({ gameState }: ScoreDisplayProps) {
  const maxScore = Math.max(...gameState.players.map((p) => p.score), 1);

  return (
    <div className={styles.scoreDisplay}>
      <h3 className={styles.title}>Scores</h3>
      <div className={styles.scores}>
        {gameState.players.map((player, index) => {
          const scorePercentage = maxScore > 0 ? (player.score / maxScore) * 100 : 0;
          return (
            <div
              key={player.id}
              className={`${styles.scoreItem} ${
                index === gameState.currentPlayerIndex ? styles.currentPlayer : ''
              }`}
            >
              <span className={styles.playerName}>{player.name}</span>
              <div className={styles.scoreBarWrapper}>
                <div className={styles.scoreBar} style={{ width: `${scorePercentage}%` }} />
                <span className={styles.score}>{player.score}</span>
              </div>
            </div>
          );
        })}
      </div>
      {gameState.isFinalTurn && <div className={styles.finalTurn}>Final Turn - Score Doubled!</div>}
    </div>
  );
}
