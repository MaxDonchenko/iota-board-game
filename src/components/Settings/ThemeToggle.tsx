import { useTheme } from '@/context/ThemeContext';
import styles from './ThemeToggle.module.css';

interface ThemeToggleProps {
  disabled?: boolean;
}

export function ThemeToggle({ disabled }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={`${styles.themeToggle} ${disabled ? styles.disabled : ''}`}>
      <label className={styles.label}>Theme</label>
      <button
        onClick={() => !disabled && toggleTheme()}
        className={styles.toggleButton}
        disabled={disabled}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
      </button>
    </div>
  );
}
