import { useState, useRef } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { GameSetup } from './components/GameSetup/GameSetup';
import { GameBoard } from './components/GameBoard/GameBoard';
import { PlayerHand } from './components/PlayerHand/PlayerHand';
import { ScoreDisplay } from './components/ScoreDisplay/ScoreDisplay';
import { GameControls } from './components/GameControls/GameControls';
import { SettingsDialog } from './components/Settings/SettingsDialog';
import { GameOverview } from './components/GameOverview/GameOverview';
import { Card as CardComponent } from './components/Card/Card';
import { useGame } from './hooks/useGame';
import type { GameMode } from './types/Game.types';
import type { Coordinate } from './types/Grid.types';
import { Card } from './game/Card';
import type { Card as CardType } from './game/Card';
import type { WildValue } from './types/Card.types';

import './styles/index.css';
import './styles/themes.css';
import './styles/card-animations.css';

function AppContent() {
  const { settings } = useSettings();
  const {
    gameState,
    startGame,
    resetGame,

    // UI selection / preview helpers
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
  } = useGame();

  const [showSettings, setShowSettings] = useState(false);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);

  const handleStartGame = (playerNames: string[], gameMode: GameMode) => {
    startGame(playerNames, gameMode, settings);
    resetSelection();
  };

  const handlePlaceCard = (position: Coordinate) => {
    placePreview(position);
  };

  const handleConfirmTurn = () => {
    confirmTurn();
  };

  const handleCancelPreview = () => {
    cancelPreview();
  };

  const handlePass = () => {
    passTurnAndClear();
  };

  const handleDiscardSelected = () => {
    discardSelected();
  };

  if (!gameState) {
    return (
      <div>
        <div style={{ textAlign: 'right', padding: '1rem', position: 'relative' }}>
          <button ref={settingsButtonRef} onClick={() => setShowSettings(!showSettings)}>
            Settings
          </button>
          <SettingsDialog
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            buttonRef={settingsButtonRef}
          />
        </div>
        <GameSetup onStartGame={handleStartGame} />
      </div>
    );
  }

  if (gameState.phase === 'ended') {
    const winner = gameState.players.reduce((prev, current) =>
      current.score > prev.score ? current : prev
    );

    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Game Over!</h1>
        <h2>
          Winner: {winner.name} with {winner.score} points
        </h2>
        <ScoreDisplay gameState={gameState} />
        <button onClick={resetGame} style={{ marginTop: '1rem' }}>
          New Game
        </button>
      </div>
    );
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      {/* Settings button - top right corner */}
      <div
        style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          zIndex: 1000,
        }}
      >
        <button ref={settingsButtonRef} onClick={() => setShowSettings(!showSettings)}>
          Settings
        </button>
      </div>

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
          maxHeight: '100vh',
        }}
      >
        {/* Game Params */}
        {gameState && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '8px',
            }}
          >
            <GameOverview gameState={gameState} gameStartTime={gameState?.startTime} />
          </div>
        )}

        {/* Current Turn / Game Controls */}
        <div
          style={{
            padding: '1rem',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '8px',
          }}
        >
          <GameControls gameState={gameState} onPass={handlePass} onNewGame={resetGame} />
        </div>

        {/* Scores */}
        <div
          style={{
            padding: '1rem',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '8px',
          }}
        >
          <ScoreDisplay gameState={gameState} />
        </div>

        {/* Player Hand - always visible */}
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

        {/* Option A: Place Cards */}
        {selectedCards.length > 0 && (
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
                  ? 'Place your selected cards on the board to score points.'
                  : 'Place all cards on the board to complete your turn.'}
              </p>
            </div>

            {pendingPlacements.length > 0 && (
              <div
                style={{
                  marginBottom: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    color: 'var(--text-primary)',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                  }}
                >
                  <span>
                    {pendingPlacements.length} of {selectedCards.length} cards placed
                  </span>
                  {nextCardIndex < selectedCards.length && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.9rem',
                      }}
                    >
                      <span style={{ opacity: 0.8 }}>Next:</span>
                      <div style={{ transform: 'scale(0.5)', transformOrigin: 'left center' }}>
                        <CardComponent card={selectedCards[nextCardIndex]} />
                      </div>
                    </div>
                  )}
                </div>

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
                      onClick={handleConfirmTurn}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#61BB46',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                      }}
                    >
                      Confirm Turn
                    </button>
                    <button
                      onClick={handleCancelPreview}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        fontSize: '1rem',
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Option B: Discard */}
        {selectedCards.length > 0 && pendingPlacements.length === 0 && (
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
              <p style={{ margin: 0 }}>
                Return selected cards to the deck and draw new ones. Your turn will end.
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <button
                onClick={handleDiscardSelected}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#F9A51B',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                Discard Selected ({selectedCards.length})
              </button>
            </div>
          </div>
        )}

        {/* Wildcard Value Selection */}
        {(() => {
          const wildcardPlacement = pendingPlacements.find((p) => p.card.isWild && !p.wildValue);
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
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                }}
              >
                <p style={{ margin: 0 }}>
                  Choose which card value your wildcard should represent for scoring.
                </p>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}
              >
                {validValues.map((value: WildValue, idx: number) => {
                  const isSelected =
                    wildcardPlacement.wildValue &&
                    wildcardPlacement.wildValue.shape === value.shape &&
                    wildcardPlacement.wildValue.number === value.number &&
                    wildcardPlacement.wildValue.color === value.color;

                  // Create a temporary card with this value for display
                  const tempCard = new Card(value.shape, value.number, value.color, false);

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        const index = pendingPlacements.findIndex((p) => p === wildcardPlacement);
                        if (index !== -1) setWildcardValueAtIndex(index, value);
                      }}
                      style={{
                        cursor: 'pointer',
                        position: 'relative',
                        opacity: isSelected ? 1 : 0.7,
                        transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                        transition: 'all 0.2s ease',
                        border: isSelected ? '3px solid #61BB46' : '3px solid transparent',
                        borderRadius: '8px',
                        padding: '2px',
                      }}
                    >
                      <CardComponent card={tempCard} />
                      {isSelected && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            width: '24px',
                            height: '24px',
                            backgroundColor: '#61BB46',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '16px',
                            border: '2px solid white',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                          }}
                        >
                          ✓
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Right side: Game Board */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '1rem',
          overflow: 'auto',
        }}
      >
        <GameBoard
          grid={gameState.grid}
          selectedCards={selectedCards}
          pendingPlacements={pendingPlacements}
          nextCardIndex={nextCardIndex}
          onPlaceCard={handlePlaceCard}
          settings={settings}
        />
      </div>
    </div>
  );
}

function App() {
  return (
    <SettingsProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SettingsProvider>
  );
}

export default App;
