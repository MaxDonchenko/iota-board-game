import { useState, useCallback } from 'react';
import { useSettings } from '@/context/SettingsContext';
import type { GameMode, PlayerConfig } from '@/types/Game.types';
import {
  PlayerCountSelector,
  GameModeSelector,
  PlayerConfigList,
} from '@/components/Setup/SetupComponents';
import styles from '@/components/GameSetup/HotseatSetup.module.css';

interface EditorSetupProps {
  onStartEditor: (playerConfigs: PlayerConfig[], gameMode: GameMode) => void;
  onBack: () => void;
}

export function EditorSetup({ onStartEditor, onBack }: EditorSetupProps) {
  const { settings } = useSettings();
  const [playerCount, setPlayerCount] = useState(2);
  const [configs, setConfigs] = useState<PlayerConfig[]>([
    { name: 'Player 1', isAI: false },
    { name: 'Player 2', isAI: false },
  ]);
  const [gameMode, setGameMode] = useState<GameMode>(settings.gameMode);

  const handlePlayerCountChange = useCallback(
    (count: number) => {
      if (gameMode === 'ultra-short' && count > 2) return;
      setPlayerCount(count);
      setConfigs((prev) => {
        const newConfigs = [...prev];
        if (count > prev.length) {
          for (let i = prev.length; i < count; i++) {
            newConfigs.push({ name: `Player ${i + 1}`, isAI: false });
          }
        } else {
          newConfigs.splice(count);
        }
        return newConfigs;
      });
    },
    [gameMode]
  );

  const handleGameModeChange = useCallback((mode: GameMode) => {
    setGameMode(mode);
    if (mode === 'ultra-short') {
      setPlayerCount((prev) => {
        if (prev > 2) {
          setConfigs((configsPrev) => {
            const newConfigs = [...configsPrev];
            newConfigs.splice(2);
            return newConfigs;
          });
          return 2;
        }
        return prev;
      });
    }
  }, []);

  const handleConfigChange = useCallback((index: number, updates: Partial<PlayerConfig>) => {
    setConfigs((prev) => {
      const newConfigs = [...prev];
      newConfigs[index] = { ...newConfigs[index], ...updates };
      return newConfigs;
    });
  }, []);

  const handleStart = useCallback(() => {
    if (configs.every((c) => c.name.trim().length > 0)) {
      onStartEditor(configs, gameMode);
    }
  }, [configs, onStartEditor, gameMode]);

  return (
    <div className={styles.setup}>
      <header className={styles.header}>
        <button onClick={onBack} className={styles.backButton}>
          ← Back
        </button>
        <h2 className={styles.title}>Editor Setup</h2>
      </header>

      <PlayerCountSelector
        playerCount={playerCount}
        gameMode={gameMode}
        onCountChange={handlePlayerCountChange}
      />

      <GameModeSelector
        gameMode={gameMode}
        onModeChange={handleGameModeChange}
        label="Initial Deck Size"
      />

      <PlayerConfigList configs={configs} onConfigChange={handleConfigChange} />

      <button onClick={handleStart} className={styles.startButton}>
        Open Board Editor
      </button>
    </div>
  );
}
