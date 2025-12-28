import { PassButton } from './PassButton';
import { WildCardRecycleButton } from './WildCardRecycleButton';
import type { GameState } from '@/types/Game.types';
import styles from './GameControls.module.css';

interface GameControlsProps {
  gameState: GameState;
  onPass: () => void;
  onRecycleWildCard?: () => void;
  onNewGame: () => void;
}

export function GameControls({
  gameState,
  onPass,
  onRecycleWildCard,
  onNewGame,
}: GameControlsProps) {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  return (
    <div className={styles.controls}>
      <div className={styles.turnInfo}>
        <h3>Current Turn: {currentPlayer.name}</h3>
        <p>Phase: {gameState.turnPhase}</p>
      </div>
      <div className={styles.actions}>
        {gameState.turnPhase === 'wildCardRecycle' && onRecycleWildCard && (
          <WildCardRecycleButton onClick={onRecycleWildCard} />
        )}
        <PassButton onClick={onPass} />
        <button onClick={onNewGame} className={styles.newGameButton}>
          New Game
        </button>
      </div>
    </div>
  );
}

