import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './MultiplayerSetup.module.css';
import { useMultiplayer } from '@/context/MultiplayerContext';
import { PlayerInfo } from '@/services/multiplayer/types';
import { Notification } from '@/components/Notification/Notification';

export function MultiplayerSetup() {
  const navigate = useNavigate();
  const { gameId: urlGameId } = useParams<{ gameId?: string }>();
  const { initializeService, isHost, setIsHost } = useMultiplayer();
  const [backend, setBackend] = useState<'supabase' | 'peerjs'>('peerjs');
  const [playerName, setPlayerName] = useState('');
  const [gameId, setGameId] = useState(''); // For joining
  const [createdGameId, setCreatedGameId] = useState(''); // For hosting
  const [status, setStatus] = useState<'idle' | 'connecting' | 'lobby'>('idle');
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Supabase Config
  const [sbUrl, setSbUrl] = useState<string>((import.meta.env.VITE_SUPABASE_URL as string) || '');
  const [sbKey, setSbKey] = useState<string>(
    (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || ''
  );

  // Read game ID from URL if present
  useEffect(() => {
    if (urlGameId && status === 'idle') {
      setGameId(urlGameId);
    }
  }, [urlGameId, status]);

  const handleBack = () => {
    navigate('/');
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
        setPlayers((prev) => [...prev, p]);
      });

      const id = await srv.connect(playerName);
      setCreatedGameId(id);
      setStatus('lobby');
      // Show host immediately in the players list
      const hostPlayer: PlayerInfo = {
        id: srv.myPlayerId || 'host',
        name: playerName,
        isHost: true,
      };
      setPlayers([hostPlayer]);
      // Update URL with game ID
      navigate(`/multiplayer/setup/${id}`, { replace: true });
    } catch (e) {
      console.error(e);
      const message = e instanceof Error ? e.message : 'Failed to create game';
      setError(message);
      setStatus('idle');
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

      // Listen for game starts or state updates?
      // Usually we wait for host to send state.

      await srv.connect(playerName, gameId);
      setStatus('lobby');
      setPlayers([
        // We don't know everyone yet until Host tells us, or we get updates.
        // For now, list myself.
        { id: 'me', name: playerName, isHost: false },
      ]);
    } catch (e) {
      console.error(e);
      const message = e instanceof Error ? e.message : 'Failed to join game';
      setError(message);
      setStatus('idle');
    }
  };

  const handleStartGame = () => {
    // In a real app, we would broadcast "START_GAME" action or initial state.
    // For now, we assume the host navigates to game, which initializes state.
    // But we need to sync this state.
    // The Game page needs to know it's multiplayer.
    navigate('/multiplayer/game');
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
            </header>

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
                    <h4>Players Joined:</h4>
                    {players.length === 0 ? (
                      <p style={{ fontStyle: 'italic', color: 'gray' }}>Waiting for players...</p>
                    ) : (
                      players.map((p) => (
                        <div key={p.id} className={styles.playerItem}>
                          {p.isHost ? '👑 ' : ''}
                          {p.name}
                        </div>
                      ))
                    )}
                  </div>

                  <button className={styles.actionButton} onClick={handleStartGame}>
                    Start Game
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
          </header>

          {error && (
            <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>
          )}

          <div className={styles.section}>
            <label className={styles.label}>Choose Backend</label>
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
                />
                <p style={{ fontSize: '0.8rem', color: 'gray' }}>
                  Required for Supabase mode. Use P2P (PeerJS) if you don't have this.
                </p>
              </div>
            </div>
          )}

          <div className={styles.section}>
            <label className={styles.label}>Your Name</label>
            <input
              className={styles.input}
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            />
          </div>

          <div className={styles.section}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label className={styles.label}>Create New Game</label>
                <p
                  style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.5rem',
                  }}
                >
                  Start a new lobby and invite friends.
                </p>
                <button className={styles.actionButton} onClick={handleCreateGame}>
                  Host Game
                </button>
              </div>

              <div style={{ width: '1px', background: 'var(--border-color)' }}></div>

              <div style={{ flex: 1 }}>
                <label className={styles.label}>Join Existing Game</label>
                <input
                  className={styles.input}
                  placeholder="Game ID"
                  value={gameId}
                  onChange={(e) => setGameId(e.target.value)}
                  style={{ marginBottom: '0.5rem' }}
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
