import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { MultiplayerService, PlayerInfo, GameAction } from './types';
import { GameState } from '@/types/Game.types';

// NOTE: In a real app, these would be env vars.
// Since we don't have a real database yet, this service will expect
// the user to provide URL and Key, OR we hardcode a demo one if we had it.
// For now, I'll allow passing them in constructor or init.

interface BroadcastPayload {
  id?: string;
  name?: string;
  [key: string]: unknown;
}

export class SupabaseService implements MultiplayerService {
  type = 'supabase' as const;
  private supabase: SupabaseClient | null = null;
  private channel: RealtimeChannel | null = null;
  private roomId: string = '';
  public myPlayerId: string = '';

  private onStateReceivedCallback: ((state: GameState) => void) | null = null;
  private onPlayerJoinedCallback: ((player: PlayerInfo) => void) | null = null;
  private onActionReceivedCallback: ((action: GameAction) => void) | null = null;

  constructor(private url: string, private key: string) {}

  connect(playerName: string, validId?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          this.supabase = createClient(this.url, this.key);

          // If validId (roomId) is not provided, generate one.
          // In Supabase, this could be a row in a 'rooms' table.
          // For simplicity with Realtime, we can just use a channel name.
          this.roomId = validId || `room-${Math.floor(Math.random() * 10000)}`;
          this.myPlayerId = `user-${Math.floor(Math.random() * 10000)}`;

          // Subscribe to channel
          this.channel = this.supabase.channel(this.roomId);

          this.channel
            .on('broadcast', { event: 'game_state' }, ({ payload }) => {
              if (this.onStateReceivedCallback) {
                this.onStateReceivedCallback(payload as GameState);
              }
            })
            .on('broadcast', { event: 'player_join' }, ({ payload }) => {
              if (this.onPlayerJoinedCallback) {
                const playerPayload = payload as BroadcastPayload;
                if (playerPayload.id !== this.myPlayerId) {
                  this.onPlayerJoinedCallback({
                    id: playerPayload.id || 'unknown',
                    name: playerPayload.name || 'Unknown',
                    isHost: false,
                  });
                }
              }
            })
            .on('broadcast', { event: 'action' }, ({ payload }) => {
              if (this.onActionReceivedCallback) {
                this.onActionReceivedCallback(payload as GameAction);
              }
            })
            .subscribe((status) => {
              if (status === 'SUBSCRIBED') {
                // Broadcast my existence
                this.channel?.send({
                  type: 'broadcast',
                  event: 'player_join',
                  payload: { id: this.myPlayerId, name: playerName },
                });
                resolve(this.roomId);
              }
              if (status === 'CHANNEL_ERROR') {
                reject(new Error('Channel Error'));
              }
            });
        } catch (err) {
          reject(err);
        }
      })();
    });
  }

  disconnect(): void {
    this.channel?.unsubscribe();
    // this.supabase?.auth.signOut(); // Not using auth for this simple demo
  }

  sendGameState(state: GameState): void {
    this.channel?.send({
      type: 'broadcast',
      event: 'game_state',
      payload: state,
    });
  }

  onGameStateReceived(callback: (state: GameState) => void): void {
    this.onStateReceivedCallback = callback;
  }

  onPlayerJoined(callback: (player: PlayerInfo) => void): void {
    this.onPlayerJoinedCallback = callback;
  }

  sendAction(action: GameAction): void {
    this.channel?.send({
      type: 'broadcast',
      event: 'action',
      payload: action,
    });
  }

  onActionReceived(callback: (action: GameAction) => void): void {
    this.onActionReceivedCallback = callback;
  }

  sendMessage(_message: string): void {}
  onMessageReceived(_callback: (message: string) => void): void {}
}
