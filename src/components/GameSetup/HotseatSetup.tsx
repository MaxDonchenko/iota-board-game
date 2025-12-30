import { useState } from 'react';
import classNames from 'classnames';
import { useSettings } from '@/context/SettingsContext';
import type { GameMode, AIDifficulty } from '@/types/Game.types';
import type { PlayerConfig } from '@/hooks/useGame';
import styles from './HotseatSetup.module.css';

interface HotseatSetupProps {
  onStartGame: (playerConfigs: PlayerConfig[], gameMode: GameMode) => void;
  onBack: () => void;
}

export function HotseatSetup({ onStartGame, onBack }: HotseatSetupProps) {
  const { settings, updateSettings } = useSettings();
  const [playerCount, setPlayerCount] = useState(2);
  const [configs, setConfigs] = useState<PlayerConfig[]>(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('vs');
    if (mode === 'ai') {
      return [
        { name: 'Player 1', isAI: false },
        { name: 'Computer', isAI: true, difficulty: 'medium' },
      ];
    }
    return [
      { name: 'Player 1', isAI: false },
      { name: 'Player 2', isAI: false },
    ];
  });
  const [gameMode, setGameMode] = useState<GameMode>(settings.gameMode);
  const [enableWildcards, setEnableWildcards] = useState(settings.enableWildcards);

  const handlePlayerCountChange = (count: number) => {
    // Limit to 2 players for ultra-short mode
    if (gameMode === 'ultra-short' && count > 2) {
      return;
    }
    setPlayerCount(count);
    const newConfigs = [...configs];
    if (count > configs.length) {
      for (let i = configs.length; i < count; i++) {
        newConfigs.push({ name: `Player ${i + 1}`, isAI: false });
      }
    } else {
      newConfigs.splice(count);
    }
    setConfigs(newConfigs);
  };

  // When game mode changes to ultra-short, limit to 2 players
  const handleGameModeChange = (mode: GameMode) => {
    setGameMode(mode);
    if (mode === 'ultra-short' && playerCount > 2) {
      setPlayerCount(2);
      const newConfigs = [...configs];
      newConfigs.splice(2);
      setConfigs(newConfigs);
    }
  };

  const handleConfigChange = (index: number, updates: Partial<PlayerConfig>) => {
    const newConfigs = [...configs];
    newConfigs[index] = { ...newConfigs[index], ...updates };
    setConfigs(newConfigs);
  };

  const handleStart = () => {
    if (configs.every((c) => c.name.trim().length > 0)) {
      // Update settings with wildcard preference before starting
      updateSettings({ enableWildcards });
      onStartGame(configs, gameMode);
    }
  };

  return (
    <div className={styles.setup}>
      <header className={styles.header}>
        <button onClick={onBack} className={styles.backButton}>
          ← Back
        </button>
        <h2 className={styles.title}>Game Setup</h2>
      </header>

      <div className={styles.section}>
        <label className={styles.label}>
          Number of Players {gameMode === 'ultra-short' ? '(2 only)' : '(2-4)'}
        </label>
        <div className={styles.buttonGroup}>
          {(gameMode === 'ultra-short' ? [2] : [2, 3, 4]).map((count) => (
            <button
              key={count}
              onClick={() => handlePlayerCountChange(count)}
              className={classNames(styles.button, { [styles.active]: playerCount === count })}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <label className={styles.label}>Deck Size</label>
        <div className={styles.buttonGroup}>
          <button
            onClick={() => handleGameModeChange('ultra-short')}
            className={classNames(styles.button, { [styles.active]: gameMode === 'ultra-short' })}
          >
            Ultra Short (16 cards)
          </button>
          <button
            onClick={() => handleGameModeChange('short')}
            className={classNames(styles.button, { [styles.active]: gameMode === 'short' })}
          >
            Short (32 cards)
          </button>
          <button
            onClick={() => handleGameModeChange('full')}
            className={classNames(styles.button, { [styles.active]: gameMode === 'full' })}
          >
            Full (64 cards)
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <label className={styles.label}>
          <input
            type="checkbox"
            checked={enableWildcards}
            onChange={(e) => setEnableWildcards(e.target.checked)}
            className={styles.checkbox}
            style={{ marginRight: '0.5rem' }}
          />
          Enable Wildcards
        </label>
        <p
          className={styles.description}
          style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}
        >
          Include wildcard cards in the deck that can represent any shape, number, or color
        </p>
      </div>

      <div className={classNames(styles.section, styles.namesSection)}>
        <label className={styles.label}>Players</label>
        <div className={styles.playerList}>
          {configs.map((config, index) => (
            <div key={index} className={styles.playerRow}>
              <div className={styles.playerMain}>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => handleConfigChange(index, { name: e.target.value })}
                  placeholder={`Player ${index + 1}`}
                  className={styles.input}
                />
                <button
                  type="button"
                  className={classNames(styles.aiToggle, { [styles.aiActive]: config.isAI })}
                  onClick={() =>
                    handleConfigChange(index, {
                      isAI: !config.isAI,
                      difficulty: !config.isAI ? 'medium' : undefined,
                      name: config.isAI ? `Player ${index + 1}` : `Computer ${index + 1}`,
                    })
                  }
                  title={config.isAI ? 'Change to Human' : 'Change to AI'}
                >
                  {config.isAI ? '🤖' : '👤'}
                </button>
              </div>
              {config.isAI && (
                <div className={styles.difficultyGroup}>
                  {(['easy', 'medium', 'hard'] as AIDifficulty[]).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      className={classNames(styles.diffButton, {
                        [styles.diffActive]: config.difficulty === diff,
                      })}
                      onClick={() => handleConfigChange(index, { difficulty: diff })}
                    >
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleStart} className={styles.startButton}>
        Start Game
      </button>
    </div>
  );
}
