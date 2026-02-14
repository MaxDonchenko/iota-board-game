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
              <div
                className={styles.handSize}
                title={`This player has ${player.hand.length} card${
                  player.hand.length === 1 ? '' : 's'
                } in hand`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={styles.cardIcon}
                >
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <line x1="7" y1="8" x2="17" y2="8" />
                  <line x1="7" y1="12" x2="17" y2="12" />
                  <line x1="7" y1="16" x2="12" y2="16" />
                </svg>
                <span className={styles.handCount}>{player.hand.length}</span>
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
          {gameState.isFinalRound ? (
            <>
              <strong>Final Round</strong>
              <div style={{ fontSize: '0.8rem', marginTop: '0.2rem', fontWeight: 'normal' }}>
                Equalizing turns. Game ends after{' '}
                {gameState.players[gameState.players.length - 1].name}&apos;s turn.
              </div>
            </>
          ) : (
            <>
              Deck is empty -{' '}
              {gameState.settings.triggerFinalRound
                ? 'Once a player finishes, the round continues until everyone has equal turns.'
                : 'Game ends when the first player finishes their hand.'}
            </>
          )}
        </div>
      )}
    </div>
  );
}
