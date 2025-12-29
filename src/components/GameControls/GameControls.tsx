import { PassButton } from './PassButton';
import { WildCardRecycleButton } from './WildCardRecycleButton';
import { useSettings } from '@/context/SettingsContext';
import { ColorUtils } from '@/utils/colors';
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
  const { settings } = useSettings();
  const redColor = ColorUtils.getSolidColor('Red', settings.theme);

  return (
    <div className={styles.controls}>
      <div className={styles.actions}>
        {gameState.turnPhase === 'wildCardRecycle' && onRecycleWildCard && (
          <WildCardRecycleButton onClick={onRecycleWildCard} />
        )}
        <PassButton onClick={onPass} />
        <button
          onClick={() => {
            if (
              window.confirm(
                'Are you sure you want to start a new game? This will end the current game.'
              )
            ) {
              onNewGame();
            }
          }}
          className={styles.newGameButton}
          style={{ backgroundColor: redColor }}
        >
          New Game
        </button>
      </div>
    </div>
  );
}
