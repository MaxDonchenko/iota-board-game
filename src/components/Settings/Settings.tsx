import { ThemeToggle } from './ThemeToggle';
import { GameModeSelector } from './GameModeSelector';
import { useTheme } from '@/context/ThemeContext';
import styles from './Settings.module.css';

export function Settings() {
  const { settings, toggleGradients } = useTheme();

  return (
    <div className={styles.settings}>
      <h2 className={styles.title}>Settings</h2>
      
      <div className={styles.section}>
        <ThemeToggle />
      </div>

      <div className={styles.section}>
        <label className={styles.label}>
          <input
            type="checkbox"
            checked={settings.useGradients}
            onChange={toggleGradients}
            className={styles.checkbox}
          />
          Enable Card Gradients
        </label>
        <p className={styles.description}>
          Add gradient effects to cards for a more stylish appearance
        </p>
      </div>

      <div className={styles.section}>
        <GameModeSelector />
      </div>
    </div>
  );
}

