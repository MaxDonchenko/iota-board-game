import { useMemo } from 'react';
import type { GameState } from '@/types/Game.types';
import { ScoreDisplay } from '../ScoreDisplay/ScoreDisplay';
import styles from './GameOver.module.css';

interface GameOverProps {
  gameState: GameState;
  onNewGame: () => void;
}

export function GameOver({ gameState, onNewGame }: GameOverProps) {
  const winners = useMemo(() => {
    const maxScore = Math.max(...gameState.players.map((p) => p.score));
    return gameState.players.filter((p) => p.score === maxScore);
  }, [gameState.players]);

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
      <h2 className={styles.title}>Game Over!</h2>

      {gameState.drawReason && (
        <div className={styles.drawInfo}>
          <div className={styles.drawReasonBadge}>
            {gameState.drawReason === 'no-valid-moves' ? '⚠️' : '🔄'} {getDrawReason()}
          </div>
          <p className={styles.drawMessage}>{getDrawMessage()}</p>
        </div>
      )}

      <div className={styles.winnerInfo}>
        <p className={styles.winnerLabel}>{winners.length > 1 ? 'Winners' : 'Winner'}</p>
        <p className={styles.winnerName} data-testid="winner-name">
          {winners.map((w) => w.name).join(', ')}
        </p>
        <p className={styles.winnerScore}>{winners[0]?.score} points</p>
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
