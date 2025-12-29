import type { GameState } from '@/types/Game.types';
import { ScoreDisplay } from '../ScoreDisplay/ScoreDisplay';
import styles from './GameOver.module.css';

interface GameOverProps {
  gameState: GameState;
  onNewGame: () => void;
}

export function GameOver({ gameState, onNewGame }: GameOverProps) {
  const winner = gameState.players.reduce((prev, current) =>
    current.score > prev.score ? current : prev
  );

  return (
    <div className={styles.gameOver}>
      <h2 className={styles.title}>Game Over!</h2>
      <div className={styles.winnerInfo}>
        <p className={styles.winnerLabel}>Winner</p>
        <p className={styles.winnerName}>{winner.name}</p>
        <p className={styles.winnerScore}>{winner.score} points</p>
      </div>

      <div className={styles.scores}>
        <ScoreDisplay gameState={gameState} />
      </div>

      <button onClick={onNewGame} className={styles.newGameButton}>
        Start New Game
      </button>
    </div>
  );
}
