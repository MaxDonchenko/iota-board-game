import { useState, useRef, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { MultiplayerProvider, useMultiplayer } from './context/MultiplayerContext';
import { useMultiplayerGame } from './hooks/useMultiplayerGame';
import { Welcome } from './components/Welcome/Welcome';
import { HotseatSetup } from './components/GameSetup/HotseatSetup';
import { MultiplayerSetup } from './components/MultiplayerSetup/MultiplayerSetup';
import { GameBoard } from './components/GameBoard/GameBoard';
import { PlayerHand } from './components/PlayerHand/PlayerHand';
import { ScoreDisplay } from './components/ScoreDisplay/ScoreDisplay';
import { SettingsDialog } from './components/Settings/SettingsDialog';
import { ActionsDialog } from './components/Actions/ActionsDialog';
import { GameOverview } from './components/GameOverview/GameOverview';
import { GameOver } from './components/GameOver/GameOver';
import { Card as CardComponent } from './components/Card/Card';
import {
  GameProvider,
  useGameContext,
  PLAYER_COLORS,
  type PlayerConfig,
} from './context/GameContext';
import type { GameMode } from './types/Game.types';
import { Card } from './game/Card';
import type { Card as CardType } from './game/Card';
import type { WildValue } from './types/Card.types';

import './styles/index.css';
import './styles/themes.css';
import './styles/card-animations.css';
import styles from './App.module.css';

function SettingsHeader() {
  const [showSettings, setShowSettings] = useState(false);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 1000 }}>
        <button
          ref={settingsButtonRef}
          onClick={() => setShowSettings(!showSettings)}
          className="settings-button"
        >
          Settings
        </button>
      </div>
      <SettingsDialog
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        buttonRef={settingsButtonRef}
      />
    </>
  );
}

function GameSession() {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const { service, myPlayerName, isHost } = useMultiplayer();
  const {
    gameState,
    resetGame,
    selectedCards,
    pendingPlacements,
    nextCardIndex,
    setSelectedCards,
    placePreview,
    confirmTurn,
    cancelPreview,
    discardSelected,
    passTurnAndClear,
    resetSelection,
    getValidWildcardValues,
    setWildcardValueAtIndex,
    exportGame,
    importGame,
  } = useGameContext();
  const { sendGameStateToPeers } = useMultiplayerGame();

  // Send game state to peers after each turn (for host)
  // Must be called before any conditional returns
  const isMultiplayer = service !== null;
  useEffect(() => {
    if (isMultiplayer && isHost && gameState && gameState.phase === 'playing') {
      // Small delay to ensure state is fully updated
      const timer = setTimeout(() => {
        sendGameStateToPeers();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [
    gameState?.currentPlayerIndex,
    gameState?.phase,
    isMultiplayer,
    isHost,
    sendGameStateToPeers,
    gameState,
  ]);

  const [showSettings, setShowSettings] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const actionsButtonRef = useRef<HTMLButtonElement>(null);

  const handleNewGame = () => {
    if (gameState && gameState.phase !== 'ended') {
      if (
        !window.confirm(
          'Are you sure you want to start a new game? This will end the current game.'
        )
      ) {
        return;
      }
    }
    resetGame();
    navigate('/');
  };

  const handleExport = () => {
    const data = exportGame();
    if (data) {
      navigator.clipboard.writeText(data).then(() => {
        alert('Game state copied to clipboard!');
      });
    }
  };

  const handleImport = () => {
    const json = prompt('Paste game state JSON:');
    if (json) {
      const result = importGame(json);
      if (!result.success) {
        alert(result.error);
      }
    }
  };

  // For multiplayer peers, wait a bit for game state to be imported
  const isMultiplayerPeer = service !== null && !isHost;

  if (!gameState) {
    // If we're a multiplayer peer, wait a moment for game state to arrive
    if (isMultiplayerPeer) {
      // Return loading state instead of redirecting immediately
      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div>Waiting for game state...</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            If this persists, the host may not have started the game yet.
          </div>
        </div>
      );
    }
    return <Navigate to="/" />;
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isGameOver = gameState.phase === 'ended';

  // In multiplayer, check if it's the current player's turn by comparing names
  // myPlayerName should be set when joining/creating game
  const isMyTurn =
    !isMultiplayer || !myPlayerName || !currentPlayer || currentPlayer.name === myPlayerName;

  return (
    <div className={styles.container}>
      <ActionsDialog
        isOpen={showActions}
        onClose={() => setShowActions(false)}
        onExport={handleExport}
        onImport={handleImport}
        onNewGame={handleNewGame}
        buttonRef={actionsButtonRef}
      />

      <SettingsDialog
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        buttonRef={settingsButtonRef}
      />

      {/* Left Sidebar */}
      <div className={styles.sidebar}>
        {/* Controls moved inside sidebar */}
        <div className={styles.controls}>
          <button
            ref={actionsButtonRef}
            onClick={() => setShowActions(!showActions)}
            className={styles.settingsButton}
            title="Additional Actions"
          >
            ⋮
          </button>
          <button
            ref={settingsButtonRef}
            onClick={() => setShowSettings(!showSettings)}
            className="settings-button"
            style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
          >
            Settings
          </button>
        </div>

        {isGameOver ? (
          <GameOver gameState={gameState} onNewGame={handleNewGame} />
        ) : (
          <>
            <div
              style={{
                padding: '1rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '8px',
              }}
            >
              <GameOverview gameState={gameState} gameStartTime={gameState?.startTime} />
            </div>

            <div
              style={{
                padding: '1rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '8px',
              }}
            >
              <ScoreDisplay gameState={gameState} />
            </div>

            {currentPlayer && (
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '8px',
                  opacity: isMyTurn ? 1 : 0.6,
                  pointerEvents: isMyTurn ? 'auto' : 'none',
                }}
              >
                <h3
                  style={{
                    color: 'var(--text-primary)',
                    marginBottom: '1rem',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                  }}
                >
                  {isMultiplayer && !isMyTurn ? `${currentPlayer.name}'s Turn` : 'Your Hand'}
                </h3>
                {isMultiplayer && !isMyTurn && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Waiting for {currentPlayer.name} to make their move...
                  </p>
                )}
                <PlayerHand
                  cards={currentPlayer.hand}
                  selectedCards={selectedCards}
                  onSelectionChange={
                    isMyTurn ? (setSelectedCards as (cards: CardType[]) => void) : () => {}
                  }
                  onResetSelection={isMyTurn ? (resetSelection as () => void) : () => {}}
                />
              </div>
            )}

            {selectedCards.length > 0 && !isGameOver && isMyTurn && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div
                  style={{
                    padding: '1rem',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  }}
                >
                  <h3
                    style={{
                      color: 'var(--text-primary)',
                      marginBottom: '1rem',
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                    }}
                  >
                    Option A: Place Cards
                  </h3>
                  <div
                    style={{
                      marginBottom: '1rem',
                      padding: '0.75rem',
                      backgroundColor: 'var(--bg-tertiary)',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                    }}
                  >
                    <p style={{ margin: 0 }}>
                      {pendingPlacements.length === 0
                        ? 'Place your selected cards on the board.'
                        : 'Place all cards to complete turn.'}
                    </p>
                  </div>
                  {pendingPlacements.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ color: 'var(--text-primary)' }}>
                        {pendingPlacements.length} of {selectedCards.length} placed
                      </span>
                      {pendingPlacements.length === selectedCards.length && (
                        <div
                          style={{
                            display: 'flex',
                            gap: '0.5rem',
                            width: '100%',
                            justifyContent: 'center',
                          }}
                        >
                          <button
                            onClick={confirmTurn}
                            className="confirm-button"
                            disabled={!isMyTurn}
                          >
                            Confirm Turn
                          </button>
                          <button
                            onClick={cancelPreview}
                            className="cancel-button"
                            disabled={!isMyTurn}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {pendingPlacements.length === 0 && (
                  <>
                    <div
                      style={{
                        padding: '1rem',
                        backgroundColor: 'var(--bg-secondary)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      }}
                    >
                      <h3
                        style={{
                          color: 'var(--text-primary)',
                          marginBottom: '1rem',
                          fontSize: '1.2rem',
                          fontWeight: 'bold',
                        }}
                      >
                        Option B: Discard
                      </h3>
                      <div
                        style={{
                          marginBottom: '1rem',
                          padding: '0.75rem',
                          backgroundColor: 'var(--bg-tertiary)',
                          borderRadius: '6px',
                          color: 'var(--text-primary)',
                          fontSize: '0.9rem',
                        }}
                      >
                        <p style={{ margin: 0 }}>Trade cards for new ones. Ends turn.</p>
                      </div>
                      <button
                        onClick={discardSelected}
                        className="discard-button"
                        disabled={!isMyTurn}
                      >
                        Discard Selected ({selectedCards.length})
                      </button>
                    </div>

                    <div
                      style={{
                        padding: '1rem',
                        backgroundColor: 'var(--bg-secondary)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      }}
                    >
                      <h3
                        style={{
                          color: 'var(--text-primary)',
                          marginBottom: '1rem',
                          fontSize: '1.2rem',
                          fontWeight: 'bold',
                        }}
                      >
                        Option C: Pass
                      </h3>
                      <div
                        style={{
                          marginBottom: '1rem',
                          padding: '0.75rem',
                          backgroundColor: 'var(--bg-tertiary)',
                          borderRadius: '6px',
                          color: 'var(--text-primary)',
                          fontSize: '0.9rem',
                        }}
                      >
                        <p style={{ margin: 0 }}>Skip your turn without changing cards.</p>
                      </div>
                      <button
                        onClick={passTurnAndClear}
                        className="cancel-button"
                        style={{ width: '100%', fontWeight: 'bold' }}
                        disabled={!isMyTurn}
                      >
                        Pass Turn
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {(() => {
              const wildcardPlacement = pendingPlacements.find(
                (p) => p.card.isWild && !p.wildValue
              );
              if (!wildcardPlacement) return null;
              const validValues = getValidWildcardValues(
                wildcardPlacement.card,
                wildcardPlacement.position
              );
              if (validValues.length === 0) return null;
              return (
                <div
                  style={{
                    padding: '1rem',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  }}
                >
                  <h3
                    style={{
                      color: 'var(--text-primary)',
                      marginBottom: '1rem',
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                    }}
                  >
                    Wildcard Value
                  </h3>
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.5rem',
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                    }}
                  >
                    {validValues.map((value: WildValue, idx: number) => {
                      const tempCard = new Card(value.shape, value.number, value.color, false);
                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            const index = pendingPlacements.findIndex(
                              (p) => p === wildcardPlacement
                            );
                            if (index !== -1) setWildcardValueAtIndex(index, value);
                          }}
                          style={{ cursor: 'pointer', padding: '2px' }}
                        >
                          <CardComponent card={tempCard} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </>
        )}
      </div>

      <div className={styles.content}>
        <GameBoard
          grid={gameState.grid}
          selectedCards={selectedCards}
          pendingPlacements={pendingPlacements}
          nextCardIndex={nextCardIndex}
          onPlaceCard={isMyTurn ? placePreview : () => {}}
          settings={settings}
          lastMovePlacements={gameState.lastMovePlacements}
          lastMovePlayerIndex={gameState.lastMovePlayerIndex}
          playerColors={PLAYER_COLORS}
        />
      </div>
    </div>
  );
}

function HotseatSetupPage() {
  const navigate = useNavigate();
  const { startGame, resetSelection } = useGameContext();
  const { settings } = useSettings();

  const handleStartGame = (playerConfigs: PlayerConfig[], gameMode: GameMode) => {
    startGame(playerConfigs, gameMode, settings);
    resetSelection();
    navigate('/hotseat/game');
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <SettingsHeader />
      <HotseatSetup onStartGame={handleStartGame} onBack={() => navigate('/')} />
    </div>
  );
}

function App() {
  return (
    <SettingsProvider>
      <ThemeProvider>
        <GameProvider>
          <MultiplayerProvider>
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/hotseat/setup" element={<HotseatSetupPage />} />
              <Route path="/hotseat/game" element={<GameSession />} />
              <Route
                path="/ai"
                element={
                  <div>
                    <SettingsHeader />
                    AI Mode (Coming Soon)
                  </div>
                }
              />
              <Route path="/multiplayer/setup/:gameId?" element={<MultiplayerSetup />} />
              <Route path="/multiplayer/game" element={<GameSession />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </MultiplayerProvider>
        </GameProvider>
      </ThemeProvider>
    </SettingsProvider>
  );
}

export default App;
