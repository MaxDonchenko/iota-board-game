import { useState, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { Welcome } from './components/Welcome/Welcome';
import { HotseatSetup } from './components/GameSetup/HotseatSetup';
import { GameBoard } from './components/GameBoard/GameBoard';
import { PlayerHand } from './components/PlayerHand/PlayerHand';
import { ScoreDisplay } from './components/ScoreDisplay/ScoreDisplay';
import { GameControls } from './components/GameControls/GameControls';
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

  const [showSettings, setShowSettings] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const actionsButtonRef = useRef<HTMLButtonElement>(null);

  const handleNewGame = () => {
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

  if (!gameState) {
    return <Navigate to="/" />;
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isGameOver = gameState.phase === 'ended';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      {/* Top Right Controls */}
      <div
        style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          zIndex: 1000,
          display: 'flex',
          gap: '0.5rem',
        }}
      >
        <button
          ref={actionsButtonRef}
          onClick={() => setShowActions(!showActions)}
          className="settings-button"
          title="Additional Actions"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
          }}
        >
          ⋮
        </button>
        <button
          ref={settingsButtonRef}
          onClick={() => setShowSettings(!showSettings)}
          className="settings-button"
        >
          Settings
        </button>
      </div>

      <ActionsDialog
        isOpen={showActions}
        onClose={() => setShowActions(false)}
        onExport={handleExport}
        onImport={handleImport}
        buttonRef={actionsButtonRef}
      />

      <SettingsDialog
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        buttonRef={settingsButtonRef}
      />

      {/* Left Sidebar */}
      <div
        style={{
          width: '400px',
          minWidth: '400px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          padding: '1rem',
          backgroundColor: 'var(--bg-primary)',
          overflowY: 'auto',
          borderRight: '1px solid var(--border-color)',
          scrollbarGutter: 'stable',
        }}
      >
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

            <div
              style={{
                padding: '1rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '8px',
              }}
            >
              <GameControls
                gameState={gameState}
                onPass={passTurnAndClear}
                onNewGame={handleNewGame}
              />
            </div>

            {currentPlayer && (
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '8px',
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
                  Your Hand
                </h3>
                <PlayerHand
                  cards={currentPlayer.hand}
                  selectedCards={selectedCards}
                  onSelectionChange={setSelectedCards as (cards: CardType[]) => void}
                  onResetSelection={resetSelection as () => void}
                />
              </div>
            )}

            {selectedCards.length > 0 && !isGameOver && (
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
                          <button onClick={confirmTurn} className="confirm-button">
                            Confirm Turn
                          </button>
                          <button onClick={cancelPreview} className="cancel-button">
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {pendingPlacements.length === 0 && (
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
                    <button onClick={discardSelected} className="discard-button">
                      Discard Selected ({selectedCards.length})
                    </button>
                  </div>
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

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <GameBoard
          grid={gameState.grid}
          selectedCards={selectedCards}
          pendingPlacements={pendingPlacements}
          nextCardIndex={nextCardIndex}
          onPlaceCard={placePreview}
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
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <SettingsHeader />
                  <Welcome />
                </>
              }
            />
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
            <Route
              path="/multiplayer"
              element={
                <div>
                  <SettingsHeader />
                  Multiplayer Mode (Coming Soon)
                </div>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </GameProvider>
      </ThemeProvider>
    </SettingsProvider>
  );
}

export default App;
