import { ThemeToggle } from './ThemeToggle';
import { GameModeSelector } from './GameModeSelector';
import { useSettings } from '@/context/SettingsContext';
import { Card } from '../Card/Card';
import { Card as CardClass } from '@/game/Card';
import styles from './Settings.module.css';

export function Settings() {
  const {
    settings,
    toggleGradients,
    toggleShowInvalidPlacements,
    setWildcardVariant,
    setCardVariant,
  } = useSettings();

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
        <label className={styles.label}>
          <input
            type="checkbox"
            checked={settings.showInvalidPlacements}
            onChange={toggleShowInvalidPlacements}
            className={styles.checkbox}
          />
          Show Invalid Placement Hints
        </label>
        <p className={styles.description}>
          Visually mark empty slots where card placement isn't allowed
        </p>
      </div>

      <div className={styles.section}>
        <GameModeSelector />
      </div>

      <div className={styles.section}>
        <div className={styles.label} style={{ cursor: 'default' }}>
          Wildcard Style
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', alignItems: 'center' }}>
          <div
            onClick={() => setWildcardVariant('modern')}
            style={{
              cursor: 'pointer',
              border:
                settings.wildcardVariant === 'modern'
                  ? '2px solid var(--text-primary)'
                  : '2px solid transparent',
              borderRadius: '4px',
              padding: '4px',
            }}
          >
            <Card card={new CardClass('Square', 1, 'Red', true)} wildcardVariant="modern" />
          </div>
          <div
            onClick={() => setWildcardVariant('original')}
            style={{
              cursor: 'pointer',
              border:
                settings.wildcardVariant === 'original'
                  ? '2px solid var(--text-primary)'
                  : '2px solid transparent',
              borderRadius: '4px',
              padding: '4px',
            }}
          >
            <Card card={new CardClass('Square', 1, 'Red', true)} wildcardVariant="original" />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.label} style={{ cursor: 'default' }}>
          Card Style
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', alignItems: 'center' }}>
          <div
            onClick={() => setCardVariant('modern')}
            style={{
              cursor: 'pointer',
              border:
                settings.cardVariant === 'modern'
                  ? '2px solid var(--text-primary)'
                  : '2px solid transparent',
              borderRadius: '4px',
              padding: '4px',
            }}
          >
            <Card card={new CardClass('Circle', 3, 'Blue', false)} cardVariant="modern" />
          </div>
          <div
            onClick={() => setCardVariant('original')}
            style={{
              cursor: 'pointer',
              border:
                settings.cardVariant === 'original'
                  ? '2px solid var(--text-primary)'
                  : '2px solid transparent',
              borderRadius: '4px',
              padding: '4px',
            }}
          >
            <Card card={new CardClass('Circle', 3, 'Blue', false)} cardVariant="original" />
          </div>
        </div>
      </div>
    </div>
  );
}
