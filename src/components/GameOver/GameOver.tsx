import type { GameState } from '@/types/Game.types';
import { ScoreDisplay } from '../ScoreDisplay/ScoreDisplay';
import styles from './GameOver.module.css';

interface GameOverProps {
  gameState: GameState;
  onNewGame: () => void;
}

export function GameOver({ gameState, onNewGame }: GameOverProps) {
  const isDraw = gameState.phase === 'draw';
  const winner = !isDraw
    ? gameState.players.reduce((prev, current) => (current.score > prev.score ? current : prev))
    : null;

  return (
    <div className={styles.gameOver}>
      <h2 className={styles.title}>{isDraw ? 'Game Drawn' : 'Game Over!'}</h2>

      {isDraw ? (
        <div className={styles.drawInfo}>
          <p className={styles.drawMessage}>
            The game ended in a draw due to threefold repetition.
          </p>
        </div>
      ) : (
        <div className={styles.winnerInfo}>
          <p className={styles.winnerLabel}>Winner</p>
          <p className={styles.winnerName}>{winner?.name}</p>
          <p className={styles.winnerScore}>{winner?.score} points</p>
        </div>
      )}

      <div className={styles.scores}>
        <ScoreDisplay gameState={gameState} />
      </div>

      <button onClick={onNewGame} className={styles.newGameButton}>
        Start New Game
      </button>
    </div>
  );
}
