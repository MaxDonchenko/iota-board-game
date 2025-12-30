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
          const scorePercentage = (player.score / maxScore) * 100;
          const isCurrent = index === gameState.currentPlayerIndex;

          return (
            <div
              key={player.id}
              className={`${styles.scoreItem} ${isCurrent ? styles.currentPlayer : ''}`}
              style={{ '--player-color': player.color } as React.CSSProperties}
            >
              <div className={styles.playerInfo}>
                <span className={styles.playerName}>
                  {player.name} {player.isAI && `(AI: ${player.difficulty})`}
                </span>
                {isCurrent && <span className={styles.turnIndicator}>Active Turn</span>}
              </div>
              <div className={styles.scoreBarWrapper}>
                <div
                  className={styles.scoreBar}
                  style={{
                    width: `${Math.max(scorePercentage, 2)}%`,
                    background: `linear-gradient(90deg, var(--player-color) 0%, var(--bg-tertiary) 100%)`,
                  }}
                />
                <span className={styles.score}>{player.score}</span>
              </div>
            </div>
          );
        })}
      </div>

      {gameState.isFinalTurn && <div className={styles.finalTurn}>Final Turn - Score Doubled!</div>}
      {gameState.deck.isEmpty() && gameState.phase === 'playing' && (
        <div
          className={styles.finalTurn}
          style={{ marginTop: '0.5rem', backgroundColor: 'var(--bg-tertiary)' }}
        >
          Deck is empty - Game will end when the first player gives all of their cards
        </div>
      )}
    </div>
  );
}
