import { useSettings } from '@/context/SettingsContext';
import styles from './GameModeSelector.module.css';

interface GameModeSelectorProps {
  disabled?: boolean;
}

export function GameModeSelector({ disabled }: GameModeSelectorProps) {
  const { settings, updateSettings } = useSettings();

  return (
    <div className={`${styles.gameModeSelector} ${disabled ? styles.disabled : ''}`}>
      <label className={styles.label}>Default Game Mode</label>
      <div className={styles.buttonGroup}>
        <button
          onClick={() => !disabled && updateSettings({ gameMode: 'ultra-short' })}
          className={`${styles.button} ${settings.gameMode === 'ultra-short' ? styles.active : ''}`}
          disabled={disabled}
        >
          Ultra Short (16 cards)
        </button>
        <button
          onClick={() => !disabled && updateSettings({ gameMode: 'short' })}
          className={`${styles.button} ${settings.gameMode === 'short' ? styles.active : ''}`}
          disabled={disabled}
        >
          Short (32 cards)
        </button>
        <button
          onClick={() => !disabled && updateSettings({ gameMode: 'full' })}
          className={`${styles.button} ${settings.gameMode === 'full' ? styles.active : ''}`}
          disabled={disabled}
        >
          Full (64 cards)
        </button>
      </div>
      <p className={styles.description}>
        This will be the default game mode when starting a new game
      </p>
    </div>
  );
}
