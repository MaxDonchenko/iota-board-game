import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { RoutingService } from '@/services/routing/RoutingService';
import styles from './MultiplayerSetup.module.css';
import { useMultiplayer } from '@/context/MultiplayerContext';
import { PlayerInfo } from '@/services/multiplayer/types';
import { Notification } from '@/components/Notification/Notification';
import { useGameContext, type PlayerConfig } from '@/context/GameContext';
import { useSettings } from '@/context/SettingsContext';
import type { GameMode } from '@/types/Game.types';
import { generateRandomName } from '@/utils/nameGenerator';
import { SettingsDialog } from '@/components/Settings/SettingsDialog';
import { useMultiplayerGame } from '@/hooks/useMultiplayerGame';
import { useRouting } from '@/hooks/useRouting';

export function MultiplayerSetup() {
  const { gameId: urlGameId } = useParams<{ gameId?: string }>();
  const [, setSearchParams] = useSearchParams();
  const routing = useRouting();
  const { initializeService, isHost, setIsHost, setMyPlayerName, service } = useMultiplayer();
  const { startGame, resetSelection, isGameActive } = useGameContext();
  const { settings } = useSettings();
  const { sendGameStateToPeers } = useMultiplayerGame();
  // Initialize backend from URL or default to peerjs
  const [backend, setBackend] = useState<'supabase' | 'peerjs'>(() => {
    const mode = RoutingService.getQueryParam('mode');
    return mode === 'supabase' || mode === 'peerjs' ? mode : 'peerjs';
  });

  // Update URL when backend changes
  useEffect(() => {
    setSearchParams(
      (prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set('mode', backend);
        return newParams;
      },
      { replace: true }
    );
  }, [backend, setSearchParams]);
  const [playerName, setPlayerName] = useState(() => generateRandomName());
  const [gameId, setGameId] = useState(''); // For joining
  const [createdGameId, setCreatedGameId] = useState(''); // For hosting
  const [status, setStatus] = useState<'idle' | 'connecting' | 'lobby'>('idle');
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isStartingGame, setIsStartingGame] = useState(false);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const MAX_PLAYERS = settings.gameMode === 'ultra-short' ? 2 : 4;

  // Supabase Config
  const [sbUrl, setSbUrl] = useState<string>((import.meta.env.VITE_SUPABASE_URL as string) || '');
  const [sbKey, setSbKey] = useState<string>(
    (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || ''
  );

  // Read game ID from URL if present (from route params or query string)
  useEffect(() => {
    if (status === 'idle') {
      // Check route params first, then query string
      const routeGameId = urlGameId || RoutingService.getGameIdFromRoute();
      const queryGameId = RoutingService.getGameIdFromUrl();
      const gameIdToUse = routeGameId || queryGameId;

      if (gameIdToUse) {
        setGameId(gameIdToUse);
      }
    }
  }, [urlGameId, status]);

  // Watch for gameState to become available after starting game
  useEffect(() => {
    if (isStartingGame && isGameActive && isHost) {
      console.log('[Multiplayer] gameState became available, sending to peers...');
      sendGameStateToPeers();
      routing.navigateToMultiplayerGame();
      console.log('[Multiplayer] Navigation triggered to game page');
      // Don't reset isStartingGame - we're navigating away
    }
  }, [isGameActive, isStartingGame, isHost, sendGameStateToPeers, routing]);

  const handleBack = () => {
    routing.navigateToHome();
  };

  const handleCreateGame = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (backend === 'supabase' && (!sbUrl || !sbKey)) {
      setError('Supabase URL and Key are required');
      return;
    }

    setError(null);
    setStatus('connecting');
    setIsHost(true);

    try {
      const srv = initializeService(
        backend,
        backend === 'supabase' ? { url: sbUrl, key: sbKey } : undefined
      );

      // Listen for players
      srv.onPlayerJoined((p) => {
        setPlayers((prev) => {
          // Check if player already exists
          if (prev.some((existing) => existing.id === p.id)) {
            return prev;
          }
          // Check player limit
          if (prev.length >= MAX_PLAYERS) {
            setError(`Maximum ${MAX_PLAYERS} players allowed`);
            return prev;
          }
          return [...prev, p];
        });
      });

      // Add timeout for connection (20 seconds)
      const connectionPromise = srv.connect(playerName);
      const timeoutPromise = new Promise<string>((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout after 20 seconds')), 20000);
      });

      const id = await Promise.race([connectionPromise, timeoutPromise]);
      setCreatedGameId(id);
      setStatus('lobby');
      setMyPlayerName(playerName);
      // Show host immediately in the players list
      const hostPlayer: PlayerInfo = {
        id: srv.myPlayerId || 'host',
        name: playerName,
        isHost: true,
      };
      setPlayers([hostPlayer]);
      // Update URL with game ID
      routing.navigateToMultiplayerSetup(id);
    } catch (e) {
      console.error(e);
      const message = e instanceof Error ? e.message : 'Failed to create game';
      setError(message);
      setStatus('idle');
      // If timeout, navigate back to setup
      if (message.includes('timeout')) {
        setTimeout(() => {
          routing.navigateToMultiplayerSetup();
        }, 2000);
      }
    }
  };

  const handleJoinGame = async () => {
    if (!playerName.trim() || !gameId.trim()) {
      setError('Please enter name and Game ID');
      return;
    }
    if (backend === 'supabase' && (!sbUrl || !sbKey)) {
      setError('Supabase URL and Key are required');
      return;
    }

    setError(null);
    setStatus('connecting');
    setIsHost(false);

    try {
      const srv = initializeService(
        backend,
        backend === 'supabase' ? { url: sbUrl, key: sbKey } : undefined
      );

      // Add timeout for connection (20 seconds)
      const connectionPromise = srv.connect(playerName, gameId);
      const timeoutPromise = new Promise<string>((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout after 20 seconds')), 20000);
      });

      await Promise.race([connectionPromise, timeoutPromise]);
      setStatus('lobby');
      setMyPlayerName(playerName);
      // Update URL with game ID when peer joins
      if (gameId) {
        routing.navigateToMultiplayerSetup(gameId);
      }
      setPlayers([
        // We don't know everyone yet until Host tells us, or we get updates.
        // For now, list myself.
        { id: 'me', name: playerName, isHost: false },
      ]);

      // Game state handling is now done by useMultiplayerGame hook
      // Just set up the listener - the hook will handle the rest
    } catch (e) {
      console.error(e);
      const message = e instanceof Error ? e.message : 'Failed to join game';
      setError(message);
      setStatus('idle');
      // If timeout, navigate back to setup
      if (message.includes('timeout')) {
        setTimeout(() => {
          routing.navigateToMultiplayerSetup();
        }, 2000);
      }
    }
  };

  const handleStartGame = () => {
    if (!isHost || players.length === 0 || !service || isStartingGame) {
      console.log('[Multiplayer] Start game blocked:', {
        isHost,
        playersCount: players.length,
        hasService: !!service,
        isStartingGame,
      });
      return;
    }

    // Validate player count for ultra-short mode
    if (settings.gameMode === 'ultra-short' && players.length > 2) {
      setError('Ultra-short mode is limited to 2 players only');
      return;
    }

    // Prevent starting with only 1 player
    if (players.length < 2) {
      setError('At least 2 players are required. Use single player mode for solo games.');
      return;
    }

    console.log('[Multiplayer] Starting game...', {
      playersCount: players.length,
      playerNames: players.map((p) => p.name),
    });

    // Prevent multiple clicks
    setIsStartingGame(true);

    // Convert PlayerInfo[] to PlayerConfig[] for game initialization
    const playerConfigs: PlayerConfig[] = players.map((p) => ({
      name: p.name,
      isAI: false, // Multiplayer players are not AI
    }));

    console.log(
      '[Multiplayer] Player configs prepared:',
      playerConfigs.map((c) => ({ name: c.name, isAI: c.isAI }))
    );

    // Use game mode from settings
    const gameMode: GameMode = settings.gameMode;

    console.log('[Multiplayer] Calling startGame with mode:', gameMode);

    // Initialize the game with the players from the lobby
    // startGame will replace any existing game state, so we don't need to clear it first
    startGame(playerConfigs, gameMode, settings);
    resetSelection();

    console.log('[Multiplayer] startGame called, waiting for game state to be ready...');
    // Note: React state updates are async, so gameState won't be available immediately
    // The useEffect hook below will handle sending the game state when it becomes available
  };

  const copyGameId = () => {
    navigator.clipboard.writeText(createdGameId).then(() => {
      setNotification('Game ID copied!');
    });
  };

  if (status === 'lobby') {
    return (
      <>
        {notification && (
          <Notification message={notification} onClose={() => setNotification(null)} />
        )}
        <div className={styles.container}>
          <div className={styles.setupCard}>
            <header className={styles.header}>
              <h2 className={styles.title}>
                Lobby ({backend === 'peerjs' ? 'PeerJS' : 'Supabase'})
              </h2>
              {isHost && (
                <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 1000 }}>
                  <button
                    ref={settingsButtonRef}
                    onClick={() => setShowSettings(true)}
                    className="settings-button"
                    style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                  >
                    Settings
                  </button>
                </div>
              )}
            </header>
            {isHost && (
              <SettingsDialog
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                buttonRef={settingsButtonRef}
              />
            )}

            <div className={styles.lobby}>
              {isHost ? (
                <>
                  <p>Share this Game ID with your friends:</p>
                  <div className={styles.gameIdBox}>
                    <span>{createdGameId}</span>
                    <button className={styles.copyButton} onClick={copyGameId} title="Copy">
                      📋
                    </button>
                  </div>

                  <div className={styles.playerList}>
                    <h4>
                      Players Joined: {players.length}/{MAX_PLAYERS}
                    </h4>
                    {players.length === 0 ? (
                      <p style={{ fontStyle: 'italic', color: 'gray' }}>Waiting for players...</p>
                    ) : (
                      players.map((p) => (
                        <div key={p.id} className={styles.playerItem}>
                          {p.isHost ? '🏠 ' : ''}
                          {p.name}
                        </div>
                      ))
                    )}
                    {players.length >= MAX_PLAYERS && (
                      <p style={{ fontSize: '0.9rem', color: 'orange', marginTop: '0.5rem' }}>
                        Maximum players reached
                      </p>
                    )}
                  </div>

                  <button
                    className={styles.actionButton}
                    onClick={handleStartGame}
                    disabled={isStartingGame}
                  >
                    {isStartingGame ? 'Starting...' : 'Start Game'}
                  </button>
                </>
              ) : (
                <>
                  <p className={styles.loading}>Connected! Waiting for host to start...</p>
                  <p style={{ fontSize: '0.9rem', color: 'gray' }}>
                    Note: The host will start the game when everyone is ready.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  if (status === 'connecting') {
    return (
      <div className={styles.container}>
        <div className={styles.setupCard}>
          <div className={styles.loading}>
            Connecting to {backend === 'peerjs' ? 'PeerJS Server' : 'Supabase'}...
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {notification && (
        <Notification message={notification} onClose={() => setNotification(null)} />
      )}
      <div className={styles.container}>
        <div className={styles.setupCard}>
          <header className={styles.header}>
            <button onClick={handleBack} className={styles.backButton}>
              ← Back
            </button>
            <h2 className={styles.title}>Multiplayer Setup</h2>
            {isHost && (
              <div style={{ position: 'absolute', top: 0, right: 0 }}>
                <button
                  ref={settingsButtonRef}
                  onClick={() => setShowSettings(!showSettings)}
                  className="settings-button"
                  style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                >
                  Settings
                </button>
              </div>
            )}
          </header>

          {error && (
            <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>
          )}

          <div className={styles.section}>
            <label
              className={styles.label}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              Choose Backend
              <a
                href="#/info#multiplayer"
                onClick={(e) => {
                  e.preventDefault();
                  routing.navigate('/info#multiplayer');
                }}
                style={{ textDecoration: 'none', color: 'inherit' }}
                title="Learn more about multiplayer modes"
              >
                ❓
              </a>
            </label>
            <div className={styles.buttonGroup}>
              <button
                className={`${styles.cardButton} ${backend === 'peerjs' ? styles.active : ''}`}
                onClick={() => setBackend('peerjs')}
              >
                <strong>PeerJS</strong>
                <span style={{ fontSize: '0.8rem' }}>Direct P2P. No DB required.</span>
              </button>
              <button
                className={`${styles.cardButton} ${backend === 'supabase' ? styles.active : ''}`}
                onClick={() => setBackend('supabase')}
              >
                <strong>Supabase</strong>
                <span style={{ fontSize: '0.8rem' }}>Reliable DB syncing.</span>
              </button>
            </div>
          </div>

          {backend === 'supabase' && (
            <div className={styles.section}>
              <label className={styles.label}>Supabase Configuration</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input
                  className={styles.input}
                  placeholder="Supabase URL (https://xyz.supabase.co)"
                  value={sbUrl}
                  onChange={(e) => setSbUrl(e.target.value)}
                />
                <input
                  className={styles.input}
                  placeholder="Supabase Anon Key"
                  value={sbKey}
                  onChange={(e) => setSbKey(e.target.value)}
                  type="password"
                  autoComplete="off"
                />
                <p style={{ fontSize: '0.8rem', color: 'gray' }}>
                  Required for Supabase mode. Use P2P (PeerJS) if you don't have this.
                </p>
              </div>
            </div>
          )}

          <div className={styles.section}>
            <label className={styles.label}>Your Name</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <input
                type="text"
                className={styles.input}
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                style={{ fontSize: '1rem', padding: '0.75rem' }}
              />
              <button
                type="button"
                onClick={() => setPlayerName(generateRandomName())}
                className={styles.actionButton}
                style={{
                  whiteSpace: 'nowrap',
                  minWidth: '3rem',
                }}
                title="Generate new name"
              >
                🎲
              </button>
            </div>
          </div>

          <div className={styles.section}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <label className={styles.label}>Create New Game</label>
                <p
                  style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.5rem',
                    minHeight: '3rem',
                  }}
                >
                  Start a new lobby and invite friends.
                </p>
                <button className={styles.actionButton} onClick={handleCreateGame}>
                  Host Game
                </button>
              </div>

              <div style={{ width: '1px', background: 'var(--border-color)' }}></div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <label className={styles.label}>Join Existing Game</label>
                <input
                  className={styles.input}
                  placeholder="Game ID"
                  value={gameId}
                  onChange={(e) => setGameId(e.target.value)}
                  style={{ marginBottom: '0.5rem', minHeight: '3rem' }}
                />
                <button
                  className={`${styles.actionButton} ${styles.secondary}`}
                  onClick={handleJoinGame}
                >
                  Join Game
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
