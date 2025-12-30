/**
 * Hook for managing multiplayer game synchronization
 * Handles all communication logic between players
 */

import { useEffect, useCallback, useRef } from 'react';
import { useMultiplayer } from '@/context/MultiplayerContext';
import { useGameContext } from '@/context/GameContext';
import { RoutingService } from '@/services/routing/RoutingService';
import { parseJson } from '@/utils/jsonParse';
import type { GameAction } from '@/services/multiplayer/types';
import type { SerializableGameState } from '@/utils/gamePersistence';

export function useMultiplayerGame() {
  const { service, isHost } = useMultiplayer();
  const { gameState, exportGame, importGame } = useGameContext();
  const hasImportedInitialState = useRef(false);
  const lastSentStateRef = useRef<string | null>(null);

  /**
   * Handle receiving game state from host (for peers)
   */
  useEffect(() => {
    if (!service || isHost) return;

    const handleGameStateReceived = (state: string | unknown) => {
      console.log('[Multiplayer] Received game state from host');

      try {
        let gameStateJson: string;
        if (typeof state === 'string') {
          gameStateJson = state;
        } else {
          console.warn('[Multiplayer] Received game state as object, serializing');
          gameStateJson = JSON.stringify({
            id: `multiplayer-${Date.now()}`,
            ...state,
          });
        }

        // Parse to verify it's valid
        const parsed = parseJson<SerializableGameState>(gameStateJson);
        console.log('[Multiplayer] Parsed game state with ID:', parsed.id);

        // Skip confirmation dialog for multiplayer
        const originalConfirm = window.confirm;
        window.confirm = () => true;

        const result = importGame(gameStateJson);
        window.confirm = originalConfirm;

        if (result.success && parsed.id) {
          console.log('[Multiplayer] Game state imported successfully');
          hasImportedInitialState.current = true;

          // Navigate to game page
          setTimeout(() => {
            RoutingService.navigateToMultiplayerGame();
          }, 300);
        } else {
          console.error('[Multiplayer] Failed to import game state:', result.error);
        }
      } catch (e) {
        console.error('[Multiplayer] Failed to parse/import game state:', e);
      }
    };

    service.onGameStateReceived(handleGameStateReceived);

    return () => {
      // Cleanup if needed
    };
  }, [service, isHost, importGame]);

  /**
   * Send game state to peers (for host)
   * Only sends if state has actually changed to avoid unnecessary network traffic
   */
  const sendGameStateToPeers = useCallback(() => {
    if (!service || !isHost || !gameState) {
      console.log('[Multiplayer] sendGameStateToPeers skipped:', {
        hasService: !!service,
        isHost,
        hasGameState: !!gameState,
      });
      return;
    }

    const gameStateJson = exportGame();
    if (gameStateJson) {
      // Only send if state has changed
      if (gameStateJson === lastSentStateRef.current) {
        console.log('[Multiplayer] Game state unchanged, skipping send');
        return;
      }

      try {
        const parsed = parseJson<SerializableGameState>(gameStateJson);
        console.log('[Multiplayer] Sending game state to peers with ID:', parsed.id);
        service.sendGameState(gameStateJson);
        lastSentStateRef.current = gameStateJson;
      } catch (e) {
        console.error('[Multiplayer] Failed to parse game state before sending:', e);
      }
    } else {
      console.warn('[Multiplayer] exportGame() returned null, cannot send to peers');
    }
  }, [service, isHost, gameState, exportGame]);

  /**
   * Send game action to host (for peers)
   */
  const sendActionToHost = useCallback(
    (actionType: string, payload: unknown) => {
      if (!service || isHost) {
        console.warn('[Multiplayer] sendActionToHost called but not a peer or no service');
        return;
      }

      const action: GameAction = {
        type: actionType,
        payload,
        playerId: service.myPlayerId || 'unknown',
      };

      console.log('[Multiplayer] Sending action to host:', actionType);
      service.sendAction(action);
    },
    [service, isHost]
  );

  /**
   * Handle receiving actions from peers (for host)
   */
  useEffect(() => {
    if (!service || !isHost) return;

    const handleActionReceived = (action: GameAction) => {
      console.log('[Multiplayer] Received action from peer:', action.type);
      // Actions will be handled by the game logic
      // This is just for logging - actual handling should be in useGame hook
    };

    service.onActionReceived(handleActionReceived);

    return () => {
      // Cleanup if needed
    };
  }, [service, isHost]);

  return {
    sendGameStateToPeers,
    sendActionToHost,
    hasImportedInitialState: hasImportedInitialState.current,
  };
}
