import { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import type { GameMode } from '@/types/Game.types';
import styles from './GameSetup.module.css';

interface GameSetupProps {
  onStartGame: (playerNames: string[], gameMode: GameMode) => void;
}

export function GameSetup({ onStartGame }: GameSetupProps) {
  const { settings } = useSettings();
  const [playerCount, setPlayerCount] = useState(2);
  const [playerNames, setPlayerNames] = useState<string[]>(['Player 1', 'Player 2']);
  const [gameMode, setGameMode] = useState<GameMode>(settings.gameMode);

  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count);
    const names: string[] = [];
    for (let i = 1; i <= count; i++) {
      names.push(playerNames[i - 1] || `Player ${i}`);
    }
    setPlayerNames(names);
  };

  const handleNameChange = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const handleStart = () => {
    if (playerNames.every((name) => name.trim().length > 0)) {
      onStartGame(playerNames, gameMode);
    }
  };

  return (
    <div className={styles.setup}>
      <h2 className={styles.title}>Game Setup</h2>

      <div className={styles.section}>
        <label className={styles.label}>Number of Players (2-4)</label>
        <div className={styles.buttonGroup}>
          {[2, 3, 4].map((count) => (
            <button
              key={count}
              onClick={() => handlePlayerCountChange(count)}
              className={`${styles.button} ${playerCount === count ? styles.active : ''}`}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <label className={styles.label}>Game Mode</label>
        <div className={styles.buttonGroup}>
          <button
            onClick={() => setGameMode('short')}
            className={`${styles.button} ${gameMode === 'short' ? styles.active : ''}`}
          >
            Short (32 cards)
          </button>
          <button
            onClick={() => setGameMode('full')}
            className={`${styles.button} ${gameMode === 'full' ? styles.active : ''}`}
          >
            Full (64 cards)
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <label className={styles.label}>Player Names</label>
        {playerNames.map((name, index) => (
          <input
            key={index}
            type="text"
            value={name}
            onChange={(e) => handleNameChange(index, e.target.value)}
            placeholder={`Player ${index + 1}`}
            className={styles.input}
          />
        ))}
      </div>

      <button onClick={handleStart} className={styles.startButton}>
        Start Game
      </button>
    </div>
  );
}
