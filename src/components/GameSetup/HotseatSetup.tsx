import { useState, useCallback } from 'react';
import { useSettings } from '@/context/SettingsContext';
import type { GameMode, PlayerConfig } from '@/types/Game.types';
import {
  PlayerCountSelector,
  GameModeSelector,
  PlayerConfigList,
} from '@/components/Setup/SetupComponents';
import styles from './HotseatSetup.module.css';
import { RoutingService } from '@/services/routing/RoutingService';

interface HotseatSetupProps {
  onStartGame: (playerConfigs: PlayerConfig[], gameMode: GameMode) => void;
  onBack: () => void;
}

export function HotseatSetup({ onStartGame, onBack }: HotseatSetupProps) {
  const { settings } = useSettings();
  const [playerCount, setPlayerCount] = useState(() => {
    return RoutingService.getQueryParam('vs') === 'ai' ? 2 : 2;
  });
  const [configs, setConfigs] = useState<PlayerConfig[]>(() => {
    const mode = RoutingService.getQueryParam('vs');
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

  const handlePlayerCountChange = useCallback(
    (count: number) => {
      if (gameMode === 'ultra-short' && count > 2) {
        return;
      }
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
      onStartGame(configs, gameMode);
    }
  }, [configs, onStartGame, gameMode]);

  return (
    <div className={styles.setup}>
      <header className={styles.header}>
        <button onClick={onBack} className={styles.backButton}>
          ← Back
        </button>
        <h2 className={styles.title}>Game Setup</h2>
      </header>

      <PlayerCountSelector
        playerCount={playerCount}
        gameMode={gameMode}
        onCountChange={handlePlayerCountChange}
      />

      <GameModeSelector gameMode={gameMode} onModeChange={handleGameModeChange} />

      <PlayerConfigList configs={configs} onConfigChange={handleConfigChange} />

      <button onClick={handleStart} className={styles.startButton}>
        Start Game
      </button>
    </div>
  );
}
