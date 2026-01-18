import React from 'react';
import classNames from 'classnames';
import type { GameMode, AIDifficulty, PlayerConfig } from '@/types/Game.types';
import styles from '@/components/GameSetup/HotseatSetup.module.css';

interface SetupSectionProps {
  label: string;
  children: React.ReactNode;
  description?: string;
  className?: string;
}

export function SetupSection({ label, children, description, className }: SetupSectionProps) {
  return (
    <div className={classNames(styles.section, className)}>
      <label className={styles.label}>{label}</label>
      {children}
      {description && <p className={styles.description}>{description}</p>}
    </div>
  );
}

interface PlayerCountSelectorProps {
  playerCount: number;
  gameMode: GameMode;
  onCountChange: (count: number) => void;
}

export function PlayerCountSelector({
  playerCount,
  gameMode,
  onCountChange,
}: PlayerCountSelectorProps) {
  const options = gameMode === 'ultra-short' ? [2] : [2, 3, 4];
  return (
    <SetupSection label={`Number of Players ${gameMode === 'ultra-short' ? '(2 only)' : '(2-4)'}`}>
      <div className={styles.buttonGroup}>
        {options.map((count) => (
          <button
            key={count}
            onClick={() => onCountChange(count)}
            className={classNames(styles.button, { [styles.active]: playerCount === count })}
          >
            {count}
          </button>
        ))}
      </div>
    </SetupSection>
  );
}

interface GameModeSelectorProps {
  gameMode: GameMode;
  onModeChange: (mode: GameMode) => void;
  label?: string;
}

export function GameModeSelector({
  gameMode,
  onModeChange,
  label = 'Deck Size',
}: GameModeSelectorProps) {
  const modes: { id: GameMode; label: string; cards: number }[] = [
    { id: 'ultra-short', label: 'Ultra Short', cards: 16 },
    { id: 'short', label: 'Short', cards: 32 },
    { id: 'full', label: 'Full', cards: 64 },
  ];

  return (
    <SetupSection label={label}>
      <div className={styles.buttonGroup}>
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={classNames(styles.button, { [styles.active]: gameMode === mode.id })}
          >
            {mode.label} ({mode.cards} cards)
          </button>
        ))}
      </div>
    </SetupSection>
  );
}

interface PlayerConfigListProps {
  configs: PlayerConfig[];
  onConfigChange: (index: number, updates: Partial<PlayerConfig>) => void;
  allowAI?: boolean;
}

export function PlayerConfigList({
  configs,
  onConfigChange,
  allowAI = true,
}: PlayerConfigListProps) {
  const handleNameChange = (index: number, name: string) => {
    onConfigChange(index, { name });
  };

  const handleAIToggle = (index: number) => {
    const config = configs[index];
    const isAI = !config.isAI;
    onConfigChange(index, {
      isAI,
      difficulty: isAI ? 'medium' : undefined,
      name: isAI ? `Computer ${index + 1}` : `Player ${index + 1}`,
    });
  };

  const handleDifficultyChange = (index: number, difficulty: AIDifficulty) => {
    onConfigChange(index, { difficulty });
  };

  return (
    <SetupSection label="Players" className={styles.namesSection}>
      <div className={styles.playerList}>
        {configs.map((config, index) => (
          <div key={index} className={styles.playerRow}>
            <div className={styles.playerMain}>
              <input
                type="text"
                value={config.name}
                onChange={(e) => handleNameChange(index, e.target.value)}
                placeholder={`Player ${index + 1}`}
                className={styles.input}
              />
              {allowAI && (
                <button
                  type="button"
                  className={classNames(styles.aiToggle, { [styles.aiActive]: config.isAI })}
                  onClick={() => handleAIToggle(index)}
                  title={config.isAI ? 'Change to Human' : 'Change to AI'}
                >
                  {config.isAI ? '🤖' : '👤'}
                </button>
              )}
            </div>
            {allowAI && config.isAI && (
              <div className={styles.difficultyGroup}>
                {(['easy', 'medium', 'hard'] as AIDifficulty[]).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    className={classNames(styles.diffButton, {
                      [styles.diffActive]: config.difficulty === diff,
                    })}
                    onClick={() => handleDifficultyChange(index, diff)}
                  >
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </SetupSection>
  );
}
