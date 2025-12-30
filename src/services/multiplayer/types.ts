import { GameState } from '@/types/Game.types';

export interface PlayerInfo {
  id: string;
  name: string;
  isHost: boolean;
}

export interface MultiplayerService {
  type: 'supabase' | 'peerjs';
  myPlayerId?: string; // ID of the current player in the session

  // validId is the ID to join, or undefined to create a new session
  connect(playerName: string, validId?: string): Promise<string>;

  disconnect(): void;

  sendGameState(state: GameState | string): void; // Can send GameState or serialized JSON string
  onGameStateReceived(callback: (state: GameState | string) => void): void;

  // For handshake
  onPlayerJoined(callback: (player: PlayerInfo) => void): void;

  // For simple chat or system messages (optional)
  sendMessage(message: string): void;
  onMessageReceived(callback: (message: string) => void): void;

  // For sending game actions (Guest -> Host)
  sendAction(action: GameAction): void;
  onActionReceived(callback: (action: GameAction) => void): void;
}

export interface GameAction {
  type: string;
  payload: unknown;
  playerId: string;
}
