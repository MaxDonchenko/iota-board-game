import { useState, useEffect, useCallback, useRef } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
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
import type { Card as CardType } from './game/Card';
import type { WildValue, Shape, Color } from './types/Card.types';
import { Card } from './game/Card';
import { Grid } from './game/Grid';
import { Validation } from './game/Validation';
import './styles/index.css';
import './styles/themes.css';
import './styles/card-animations.css';

function AppContent() {
  const { settings } = useTheme();
  const { gameState, startGame, placeCards, passTurn, discardCards, resetGame } = useGame();
  const [showSettings, setShowSettings] = useState(false);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const [gameStartTime, setGameStartTime] = useState<Date | undefined>();
  const [selectedCards, setSelectedCards] = useState<CardType[]>([]);
  const [pendingPlacements, setPendingPlacements] = useState<
    Array<{ card: CardType; position: Coordinate; wildValue?: WildValue }>
  >([]);
  const [nextCardIndex, setNextCardIndex] = useState(0);

  // Clear selections when turn changes
  useEffect(() => {
    if (gameState) {
      setSelectedCards([]);
      setPendingPlacements([]);
      setNextCardIndex(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState?.currentPlayerIndex]);

  // Clear pending placements when all cards are deselected
  useEffect(() => {
    if (selectedCards.length === 0 && pendingPlacements.length > 0) {
      setPendingPlacements([]);
      setNextCardIndex(0);
      return;
    }

    // Remove placements for cards that are no longer selected
    const placementsToKeep = pendingPlacements.filter((p) => selectedCards.includes(p.card));
    if (placementsToKeep.length !== pendingPlacements.length) {
      setPendingPlacements(placementsToKeep);
      // Recalculate nextCardIndex to point to first unplaced card
      let newNextCardIndex = 0;
      for (let i = 0; i < selectedCards.length; i++) {
        const isPlaced = placementsToKeep.some((p) => p.card === selectedCards[i]);
        if (!isPlaced) {
          newNextCardIndex = i;
          break;
        }
        newNextCardIndex = i + 1;
      }
      setNextCardIndex(Math.min(newNextCardIndex, selectedCards.length));
    }
  }, [selectedCards, pendingPlacements]);

  const handleStartGame = (playerNames: string[], gameMode: GameMode) => {
    startGame(playerNames, gameMode, settings);
    setGameStartTime(new Date());
    setSelectedCards([]);
    setPendingPlacements([]);
  };

  const handleCardSelect = (card: CardType) => {
    if (selectedCards.includes(card)) {
      // Deselecting a card - just remove it from selection
      // The useEffect will handle cleaning up pending placements
      setSelectedCards(selectedCards.filter((c) => c !== card));
    } else if (selectedCards.length < 4) {
      setSelectedCards([...selectedCards, card]);
    }
  };

  // Helper to get complete line for wildcard validation
  const getCompleteLineForWildcard = useCallback(
    (
      position: Coordinate,
      direction: 'horizontal' | 'vertical',
      grid: Grid,
      wildCard: CardType
    ): { cards: CardType[]; positions: Coordinate[] } | null => {
      const allCards = new Map<string, CardType>();

      // Add existing cards
      for (const [key, card] of grid.positions.entries()) {
        allCards.set(key, card);
      }

      // Add the wildcard at this position
      allCards.set(`${position.x},${position.y}`, wildCard);

      const positions: Coordinate[] = [position];
      const cards: CardType[] = [wildCard];

      if (direction === 'horizontal') {
        let leftX = position.x - 1;
        while (allCards.has(`${leftX},${position.y}`)) {
          const card = allCards.get(`${leftX},${position.y}`);
          if (card) {
            positions.unshift({ x: leftX, y: position.y });
            cards.unshift(card);
          }
          leftX--;
        }

        let rightX = position.x + 1;
        while (allCards.has(`${rightX},${position.y}`)) {
          const card = allCards.get(`${rightX},${position.y}`);
          if (card) {
            positions.push({ x: rightX, y: position.y });
            cards.push(card);
          }
          rightX++;
        }
      } else {
        let upY = position.y - 1;
        while (allCards.has(`${position.x},${upY}`)) {
          const card = allCards.get(`${position.x},${upY}`);
          if (card) {
            positions.unshift({ x: position.x, y: upY });
            cards.unshift(card);
          }
          upY--;
        }

        let downY = position.y + 1;
        while (allCards.has(`${position.x},${downY}`)) {
          const card = allCards.get(`${position.x},${downY}`);
          if (card) {
            positions.push({ x: position.x, y: downY });
            cards.push(card);
          }
          downY++;
        }
      }

      return { cards, positions };
    },
    []
  );

  // Find all valid wildcard values for a placed wildcard
  const getValidWildcardValues = useCallback(
    (wildCard: CardType, position: Coordinate): WildValue[] => {
      if (!gameState || !wildCard.isWild || wildCard.wildValue) {
        return [];
      }

      // Create temporary grid with pending placements
      const tempGrid = new Grid();
      for (const [key, card] of gameState.grid.positions.entries()) {
        const [x, y] = key.split(',').map(Number);
        tempGrid.addCard(x, y, card);
      }

      // Add other pending placements (excluding this wildcard)
      for (const placement of pendingPlacements) {
        if (placement.position.x !== position.x || placement.position.y !== position.y) {
          const card = placement.card;
          if (card.wildValue) {
            const cardWithValue = new Card(
              card.shape,
              card.number,
              card.color,
              true,
              card.wildValue
            );
            tempGrid.addCard(placement.position.x, placement.position.y, cardWithValue);
          } else {
            tempGrid.addCard(placement.position.x, placement.position.y, card);
          }
        }
      }

      // Get lines this wildcard would be part of
      const hLine = getCompleteLineForWildcard(position, 'horizontal', tempGrid, wildCard);
      const vLine = getCompleteLineForWildcard(position, 'vertical', tempGrid, wildCard);

      const validValues: WildValue[] = [];
      const shapes: Shape[] = ['Square', 'Circle', 'Triangle', 'Plus'];
      const numbers: Array<1 | 2 | 3 | 4> = [1, 2, 3, 4];
      const colors: Color[] = ['Red', 'Blue', 'Green', 'Yellow'];

      // Try all combinations
      for (const shape of shapes) {
        for (const number of numbers) {
          for (const color of colors) {
            const testValue: WildValue = { shape, number, color };
            const testCard = new Card(shape, number, color, true, testValue);

            // Check if this value works for all lines
            let isValid = true;

            if (hLine && hLine.cards.length >= 2) {
              const testHLine = hLine.cards
                .filter((c) => c !== undefined && c !== null)
                .map((c) => (c && c.isWild && !c.wildValue ? testCard : c)) as CardType[];
              const hResult = Validation.validateLineRules(testHLine);
              if (!hResult.isValid) {
                isValid = false;
              }
            }

            if (isValid && vLine && vLine.cards.length >= 2) {
              const testVLine = vLine.cards
                .filter((c) => c !== undefined && c !== null)
                .map((c) => (c && c.isWild && !c.wildValue ? testCard : c)) as CardType[];
              const vResult = Validation.validateLineRules(testVLine);
              if (!vResult.isValid) {
                isValid = false;
              }
            }

            if (isValid) {
              validValues.push(testValue);
            }
          }
        }
      }

      return validValues;
    },
    [gameState, pendingPlacements, getCompleteLineForWildcard]
  );

  const handlePlaceCard = (position: Coordinate) => {
    if (!gameState || selectedCards.length === 0) return;

    // Get the next card to place
    if (nextCardIndex >= selectedCards.length) {
      return; // All cards already placed in preview
    }

    const card = selectedCards[nextCardIndex];
    const newPlacements = [...pendingPlacements, { card, position }];
    setPendingPlacements(newPlacements);
    setNextCardIndex(nextCardIndex + 1);
  };

  const handleConfirmTurn = () => {
    if (!gameState || pendingPlacements.length === 0) return;

    // Replace wildcards with regular cards using selected values
    // Store mapping of new cards to original cards for hand removal
    const cardMapping = new Map<Card, Card>();
    const placements = pendingPlacements.map((p) => {
      let card = p.card;
      const originalCard = p.card;

      // If it's a wildcard with a selected value, replace it with a regular card
      if (card.isWild && p.wildValue) {
        card = new Card(
          p.wildValue.shape,
          p.wildValue.number,
          p.wildValue.color,
          false // Not a wildcard anymore
        );
        // Store mapping for hand removal
        cardMapping.set(card, originalCard);
      }
      return {
        card,
        position: p.position,
      };
    });

    const result = placeCards(placements, cardMapping);
    if (result.success) {
      setSelectedCards([]);
      setPendingPlacements([]);
      setNextCardIndex(0);
    } else {
      // Show error and reset
      alert(result.error || 'Invalid placement');
      setPendingPlacements([]);
      setNextCardIndex(0);
    }
  };

  const handleCancelPreview = () => {
    setPendingPlacements([]);
    setNextCardIndex(0);
  };

  const handlePass = () => {
    passTurn();
    setSelectedCards([]);
    setPendingPlacements([]);
    setNextCardIndex(0);
  };

  const handleDiscardSelected = () => {
    if (selectedCards.length === 0) return;

    // Check if any selected card is a wildcard
    const hasWildcard = selectedCards.some((card) => card.isWild);

    if (hasWildcard) {
      const confirmed = window.confirm(
        'Warning: You are about to discard a wildcard, which is a rare and valuable card.\n\n' +
          'Are you sure you want to proceed?'
      );
      if (!confirmed) {
        return;
      }
    }

    const result = discardCards(selectedCards);
    if (result.success) {
      setSelectedCards([]);
      setPendingPlacements([]);
      setNextCardIndex(0);
    } else {
      alert(result.error || 'Failed to discard cards');
    }
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
            <GameOverview
              gameState={gameState}
              gameStartTime={gameStartTime ?? gameState.startTime}
            />
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
              onCardSelect={handleCardSelect}
              selectedCards={selectedCards}
              onSelectionChange={setSelectedCards}
              onResetSelection={() => {
                setSelectedCards([]);
                setPendingPlacements([]);
                setNextCardIndex(0);
              }}
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
                        const updated = pendingPlacements.map((p) =>
                          p === wildcardPlacement ? { ...p, wildValue: value } : p
                        );
                        setPendingPlacements(updated);
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
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
