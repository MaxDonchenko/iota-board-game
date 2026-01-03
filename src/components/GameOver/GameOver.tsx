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

  const getDrawReason = () => {
    if (gameState.drawReason === 'no-valid-moves') {
      return 'No Valid Moves';
    }
    return 'Threefold Repetition';
  };

  const getDrawMessage = () => {
    if (gameState.drawReason === 'no-valid-moves') {
      return `None of the players has valid moves available:
      • Can't place any cards on the board
      • Can't exchange cards (empty deck)
      • No wildcards on the board to recycle`;
    }
    return 'All players passed three times in a row.';
  };

  return (
    <div className={styles.gameOver}>
      <h2 className={styles.title}>{isDraw ? 'Game Drawn' : 'Game Over!'}</h2>

      {isDraw ? (
        <div className={styles.drawInfo}>
          <div className={styles.drawReasonBadge}>
            {gameState.drawReason === 'no-valid-moves' ? '⚠️' : '🔄'} {getDrawReason()}
          </div>
          <p className={styles.drawMessage}>{getDrawMessage()}</p>
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
