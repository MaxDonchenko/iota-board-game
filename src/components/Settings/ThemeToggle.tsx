import { useTheme } from '@/context/ThemeContext';
import styles from './ThemeToggle.module.css';

export function ThemeToggle() {
  const { settings, toggleTheme } = useTheme();

  return (
    <div className={styles.themeToggle}>
      <label className={styles.label}>Theme</label>
      <button
        onClick={toggleTheme}
        className={styles.toggleButton}
        aria-label={`Switch to ${settings.theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {settings.theme === 'light' ? '🌙 Dark' : '☀️ Light'}
      </button>
      <p className={styles.description}>
        Current theme: {settings.theme === 'light' ? 'Light' : 'Dark'}
      </p>
    </div>
  );
}

