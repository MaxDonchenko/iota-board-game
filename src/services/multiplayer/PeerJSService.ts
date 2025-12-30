import Peer, { DataConnection } from 'peerjs';
import { MultiplayerService, PlayerInfo, GameAction } from './types';
import { GameState } from '@/types/Game.types';

const PEERJS_LOG_PREFIX = '[PeerJS]';

export class PeerJSService implements MultiplayerService {
  type = 'peerjs' as const;
  peer: Peer | null = null;
  connections: DataConnection[] = []; // Host keeps all, Guest keeps one (Host)
  hostConnection: DataConnection | null = null;

  isHost = false;
  myPlayerId: string = '';
  myPlayerName: string = '';

  // Callbacks
  private onStateReceivedCallback: ((state: GameState | string) => void) | null = null;
  private onPlayerJoinedCallback: ((player: PlayerInfo) => void) | null = null;
  private onActionReceivedCallback: ((action: GameAction) => void) | null = null;

  connect(playerName: string, validId?: string): Promise<string> {
    this.myPlayerName = playerName;
    return new Promise((resolve, reject) => {
      // Create a new peer with a random ID
      this.peer = new Peer();

      this.peer.on('open', (id) => {
        this.myPlayerId = id;
        console.log(`${PEERJS_LOG_PREFIX} My Peer ID:`, id);

        if (validId) {
          // Joining an existing game
          this.isHost = false;
          this.connectToHost(validId, playerName)
            .then(() => {
              resolve(id);
            })
            .catch(reject);
        } else {
          // Hosting
          this.isHost = true;
          resolve(id); // The ID to share
        }
      });

      this.peer.on('connection', (conn) => {
        if (this.isHost) {
          this.handleIncomingConnection(conn);
        } else {
          // Guests shouldn't receive random connections usually, but maybe for p2p mesh?
          // For Authoritative Host, only Host accepts connections
          conn.close();
        }
      });

      this.peer.on('error', (err) => {
        console.error(`${PEERJS_LOG_PREFIX} Error:`, err);
        reject(err);
      });
    });
  }

  private connectToHost(hostId: string, playerName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.peer) return reject('No peer');

      const conn = this.peer.connect(hostId, {
        metadata: { name: playerName },
      });

      conn.on('open', () => {
        console.log(`${PEERJS_LOG_PREFIX} Connected to host`);
        this.hostConnection = conn;
        this.setupConnectionListeners(conn);
        resolve();
      });

      conn.on('error', (err) => {
        console.error(`${PEERJS_LOG_PREFIX} Connection error:`, err);
        reject(err);
      });
    });
  }

  private handleIncomingConnection(conn: DataConnection) {
    conn.on('open', () => {
      const playerName = (conn.metadata as { name?: string })?.name || 'Unknown';
      console.log(`${PEERJS_LOG_PREFIX} New client connected:`, playerName);
      this.connections.push(conn);
      this.setupConnectionListeners(conn);

      if (this.onPlayerJoinedCallback) {
        this.onPlayerJoinedCallback({
          id: conn.peer,
          name: playerName,
          isHost: false,
        });
      }

      // Send current list of players or handshake?
      // For now, let the host UI handle broadcasting the game state / player list
    });
  }

  private setupConnectionListeners(conn: DataConnection) {
    conn.on('data', (data: unknown) => {
      if (data && typeof data === 'object' && data !== null) {
        const message = data as { type?: string; payload?: unknown };
        if (message.type === 'GAME_STATE' && this.onStateReceivedCallback && message.payload) {
          // Always receive as string - PeerJS sends strings more reliably
          const payload =
            typeof message.payload === 'string' ? message.payload : JSON.stringify(message.payload);
          this.onStateReceivedCallback(payload);
        } else if (message.type === 'ACTION' && this.onActionReceivedCallback && message.payload) {
          this.onActionReceivedCallback(message.payload as GameAction);
        }
      }
    });

    conn.on('close', () => {
      console.log(`${PEERJS_LOG_PREFIX} Connection closed`);
      this.connections = this.connections.filter((c) => c !== conn);
      if (conn === this.hostConnection) {
        this.hostConnection = null;
        alert('Host disconnected');
      }
    });
  }

  disconnect(): void {
    this.connections.forEach((c) => c.close());
    this.hostConnection?.close();
    this.peer?.destroy();
  }

  sendGameState(state: GameState | string): void {
    if (!this.isHost) return; // Only host sends state
    // Always send as string for simplicity - PeerJS handles strings better
    const payload = typeof state === 'string' ? state : JSON.stringify(state);
    const message = { type: 'GAME_STATE', payload };
    this.connections.forEach((conn) => {
      try {
        conn.send(message);
        console.log(`${PEERJS_LOG_PREFIX} Sent game state to peer`);
      } catch (e) {
        console.error(`${PEERJS_LOG_PREFIX} Failed to send game state:`, e);
      }
    });
  }

  sendAction(action: GameAction): void {
    if (this.isHost) {
      // If I'm host, I just execute it locally?
      // Or I treat myself as a client?
      // Usually the UI calls service.sendAction for remote actions.
      // If I'm host, the UI might call game logic directly.
      // But for consistency, maybe we handle loopback?
      // For now, assume this is for GUEST -> HOST
      console.warn(`${PEERJS_LOG_PREFIX} Host calling sendAction? Host should execute directly.`);
    } else if (this.hostConnection) {
      this.hostConnection.send({ type: 'ACTION', payload: action });
    }
  }

  onGameStateReceived(callback: (state: GameState | string) => void): void {
    this.onStateReceivedCallback = callback;
  }

  onPlayerJoined(callback: (player: PlayerInfo) => void): void {
    this.onPlayerJoinedCallback = callback;
  }

  onActionReceived(callback: (action: GameAction) => void): void {
    this.onActionReceivedCallback = callback;
  }

  sendMessage(_message: string): void {
    // Implement if needed
  }
  onMessageReceived(_callback: (message: string) => void): void {
    // Implement if needed
  }
}
