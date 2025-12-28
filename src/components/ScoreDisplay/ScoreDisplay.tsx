import type { GameState } from '@/types/Game.types';
import styles from './ScoreDisplay.module.css';

interface ScoreDisplayProps {
  gameState: GameState;
}

export function ScoreDisplay({ gameState }: ScoreDisplayProps) {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  return (
    <div className={styles.scoreDisplay}>
      <h3 className={styles.title}>Scores</h3>
      <div className={styles.scores}>
        {gameState.players.map((player, index) => (
          <div
            key={player.id}
            className={`${styles.scoreItem} ${
              index === gameState.currentPlayerIndex ? styles.currentPlayer : ''
            }`}
          >
            <span className={styles.playerName}>{player.name}</span>
            <span className={styles.score}>{player.score}</span>
          </div>
        ))}
      </div>
      {gameState.isFinalTurn && (
        <div className={styles.finalTurn}>Final Turn - Score Doubled!</div>
      )}
    </div>
  );
}

