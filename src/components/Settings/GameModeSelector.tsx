import { useTheme } from '@/context/ThemeContext';
import styles from './GameModeSelector.module.css';

export function GameModeSelector() {
  const { settings, updateSettings } = useTheme();

  return (
    <div className={styles.gameModeSelector}>
      <label className={styles.label}>Default Game Mode</label>
      <div className={styles.buttonGroup}>
        <button
          onClick={() => updateSettings({ gameMode: 'short' })}
          className={`${styles.button} ${settings.gameMode === 'short' ? styles.active : ''}`}
        >
          Short (32 cards)
        </button>
        <button
          onClick={() => updateSettings({ gameMode: 'full' })}
          className={`${styles.button} ${settings.gameMode === 'full' ? styles.active : ''}`}
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

