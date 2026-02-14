import classNames from 'classnames';
import { ThemeToggle } from './ThemeToggle';
import { GameModeSelector } from './GameModeSelector';
import { useSettings } from '@/context/SettingsContext';
import { useGame } from '@/hooks/useGame';
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
    toggleTriggerFinalRound,
  } = useSettings();

  const { isGameActive } = useGame();

  return (
    <div className={styles.settings}>
      <h2 className={styles.title}>Settings</h2>

      {isGameActive && (
        <div className={styles.disabledMessage}>
          Some settings are hidden or disabled while a game is in progress to prevent logic
          conflicts.
        </div>
      )}

      <div className={classNames(styles.section, { [styles.disabled]: isGameActive })}>
        <ThemeToggle disabled={isGameActive} />
      </div>

      <div className={classNames(styles.section, { [styles.disabled]: isGameActive })}>
        <label className={styles.label}>
          <input
            type="checkbox"
            checked={settings.useGradients}
            onChange={toggleGradients}
            className={styles.checkbox}
            disabled={isGameActive}
          />
          Enable Card Gradients
        </label>
        <p className={styles.description}>
          Add gradient effects to cards for a more stylish appearance
        </p>
      </div>

      <div className={classNames(styles.section, { [styles.disabled]: isGameActive })}>
        <label className={styles.label}>
          <input
            type="checkbox"
            checked={settings.showInvalidPlacements}
            onChange={toggleShowInvalidPlacements}
            className={styles.checkbox}
            disabled={isGameActive}
          />
          Show Invalid Placement Hints
        </label>
        <p className={styles.description}>
          Visually mark empty slots where card placement isn't allowed
        </p>
      </div>

      <div className={classNames(styles.section, { [styles.disabled]: isGameActive })}>
        <label className={styles.label}>
          <input
            type="checkbox"
            checked={settings.triggerFinalRound}
            onChange={toggleTriggerFinalRound}
            className={styles.checkbox}
            disabled={isGameActive}
          />
          Equalize Turns (Final Round)
        </label>
        <p className={styles.description}>
          When a player finishes, continue the round so everyone has the same number of turns
        </p>
      </div>

      <div className={classNames(styles.section, { [styles.disabled]: isGameActive })}>
        <GameModeSelector disabled={isGameActive} />
      </div>

      <div className={classNames(styles.section, { [styles.disabled]: isGameActive })}>
        <div className={styles.label} style={{ cursor: isGameActive ? 'not-allowed' : 'default' }}>
          Wildcard Style
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', alignItems: 'center' }}>
          <div
            onClick={() => !isGameActive && setWildcardVariant('modern')}
            style={{
              cursor: isGameActive ? 'not-allowed' : 'pointer',
              border:
                settings.wildcardVariant === 'modern'
                  ? '2px solid var(--text-primary)'
                  : '2px solid transparent',
              borderRadius: '4px',
              padding: '4px',
              opacity: isGameActive && settings.wildcardVariant !== 'modern' ? 0.3 : 1,
            }}
          >
            <Card card={new CardClass('Square', 1, 'Red', true)} wildcardVariant="modern" />
          </div>
          <div
            onClick={() => !isGameActive && setWildcardVariant('original')}
            style={{
              cursor: isGameActive ? 'not-allowed' : 'pointer',
              border:
                settings.wildcardVariant === 'original'
                  ? '2px solid var(--text-primary)'
                  : '2px solid transparent',
              borderRadius: '4px',
              padding: '4px',
              opacity: isGameActive && settings.wildcardVariant !== 'original' ? 0.3 : 1,
            }}
          >
            <Card card={new CardClass('Square', 1, 'Red', true)} wildcardVariant="original" />
          </div>
        </div>
      </div>

      <div className={classNames(styles.section, { [styles.disabled]: isGameActive })}>
        <div className={styles.label} style={{ cursor: isGameActive ? 'not-allowed' : 'default' }}>
          Card Style
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', alignItems: 'center' }}>
          <div
            onClick={() => !isGameActive && setCardVariant('modern')}
            style={{
              cursor: isGameActive ? 'not-allowed' : 'pointer',
              border:
                settings.cardVariant === 'modern'
                  ? '2px solid var(--text-primary)'
                  : '2px solid transparent',
              borderRadius: '4px',
              padding: '4px',
              opacity: isGameActive && settings.cardVariant !== 'modern' ? 0.3 : 1,
            }}
          >
            <Card card={new CardClass('Circle', 3, 'Blue', false)} cardVariant="modern" />
          </div>
          <div
            onClick={() => !isGameActive && setCardVariant('original')}
            style={{
              cursor: isGameActive ? 'not-allowed' : 'pointer',
              border:
                settings.cardVariant === 'original'
                  ? '2px solid var(--text-primary)'
                  : '2px solid transparent',
              borderRadius: '4px',
              padding: '4px',
              opacity: isGameActive && settings.cardVariant !== 'original' ? 0.3 : 1,
            }}
          >
            <Card card={new CardClass('Circle', 3, 'Blue', false)} cardVariant="original" />
          </div>
        </div>
      </div>
    </div>
  );
}
