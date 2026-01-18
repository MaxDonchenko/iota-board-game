import { useState, useCallback, useMemo } from 'react';
import { GameStateManager } from '@/game/GameState';
import { Card } from '@/game/Card';
import { Grid } from '@/game/Grid';
import {
  serializeGameState,
  deserializeGameState,
  generateGameId,
  saveGameToStorage,
  type SerializableGameState,
} from '@/utils/gamePersistence';
import type { GameState, GameSettings, GameMode, PlayerConfig } from '@/types/Game.types';
import type { Coordinate } from '@/types/Grid.types';
import type { Shape, Number, Color } from '@/types/Card.types';

const PLAYER_COLORS = ['#FF4B2B', '#2B95FF', '#61BB46', '#F9A51B'];

export function useBoardEditor(
  playerConfigs: PlayerConfig[] = [
    { name: 'Player 1', isAI: false },
    { name: 'Player 2', isAI: false },
  ],
  initialGameMode: GameMode = 'full'
) {
  const [gameState, setGameState] = useState<GameState>(() => {
    const settings: GameSettings = {
      theme: 'light',
      useGradients: true,
      gameMode: initialGameMode,
      showInvalidPlacements: true,
      wildcardVariant: 'modern',
      cardVariant: 'modern',
      enableWildcards: true,
    };
    const configsWithColors = playerConfigs.map((c, i) => ({
      ...c,
      color: PLAYER_COLORS[i % PLAYER_COLORS.length],
    }));
    return GameStateManager.createInitialState(configsWithColors, initialGameMode, settings);
  });

  const [selectedEditorCard, setSelectedEditorCard] = useState<Card | null>(null);

  const placeCard = useCallback(
    (position: Coordinate) => {
      if (!selectedEditorCard) return;

      setGameState((prev) => {
        const newGrid = new Grid();
        // Clone existing grid
        for (const [key, card] of prev.grid.positions.entries()) {
          const [x, y] = key.split(',').map(Number);
          newGrid.addCard(x, y, card);
        }
        // Preserve starter card and position
        if (prev.grid.starterCard) {
          newGrid.starterCard = prev.grid.starterCard;
          newGrid.starterPosition = prev.grid.starterPosition;
        }

        // Add or replace card
        newGrid.addCard(position.x, position.y, selectedEditorCard);

        return {
          ...prev,
          grid: newGrid,
        };
      });
    },
    [selectedEditorCard]
  );

  const removeCard = useCallback((position: Coordinate) => {
    setGameState((prev) => {
      const newGrid = new Grid();
      for (const [key, card] of prev.grid.positions.entries()) {
        const [x, y] = key.split(',').map(Number);
        if (x === position.x && y === position.y) continue;
        newGrid.addCard(x, y, card);
      }
      // Preserve starter card and position
      if (prev.grid.starterCard) {
        newGrid.starterCard = prev.grid.starterCard;
        newGrid.starterPosition = prev.grid.starterPosition;
      }
      return {
        ...prev,
        grid: newGrid,
      };
    });
  }, []);

  const updatePlayerHand = useCallback((playerIndex: number, cards: Card[]) => {
    setGameState((prev) => ({
      ...prev,
      players: prev.players.map((p, i) => (i === playerIndex ? { ...p, hand: cards } : p)),
    }));
  }, []);

  const exportEditorGame = useCallback(() => {
    const serialized = serializeGameState(gameState, generateGameId());
    return JSON.stringify(serialized);
  }, [gameState]);

  const importEditorGame = useCallback((json: string) => {
    try {
      const serialized = JSON.parse(json) as SerializableGameState;
      const loadedState = deserializeGameState(serialized);
      setGameState(loadedState);
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Invalid game JSON' };
    }
  }, []);

  const continueGame = useCallback(() => {
    // Ensure game state is ready for playing
    const gameId = generateGameId();
    console.log('[BoardEditor] Continuing game with ID:', gameId);
    saveGameToStorage(gameState, gameId);
    return gameId;
  }, [gameState]);

  const allPossibleCards = useMemo(() => {
    const cards: Card[] = [];
    const shapes: Shape[] = ['Square', 'Circle', 'Triangle', 'Plus'];
    const numbers: Number[] = [1, 2, 3, 4];
    const colors: Color[] = ['Red', 'Blue', 'Green', 'Yellow'];

    for (const shape of shapes) {
      for (const number of numbers) {
        for (const color of colors) {
          cards.push(new Card(shape, number, color));
        }
      }
    }

    // Add wildcards with typical values for easy picking
    cards.push(new Card(undefined, undefined, undefined, true));

    return cards;
  }, []);

  return {
    gameState,
    selectedEditorCard,
    allPossibleCards,
    setSelectedEditorCard,
    placeCard,
    removeCard,
    updatePlayerHand,
    exportEditorGame,
    importEditorGame,
    continueGame,
  };
}
