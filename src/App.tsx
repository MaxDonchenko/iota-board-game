import { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { GameSetup } from './components/GameSetup/GameSetup';
import { GameBoard } from './components/GameBoard/GameBoard';
import { PlayerHand } from './components/PlayerHand/PlayerHand';
import { ScoreDisplay } from './components/ScoreDisplay/ScoreDisplay';
import { GameControls } from './components/GameControls/GameControls';
import { Settings } from './components/Settings/Settings';
import { useGame } from './hooks/useGame';
import type { GameMode } from './types/Game.types';
import type { Coordinate } from './types/Grid.types';
import type { Card as CardType } from './game/Card';
import './styles/index.css';
import './styles/themes.css';
import './styles/card-animations.css';

function AppContent() {
  const { settings } = useTheme();
  const { gameState, startGame, placeCards, passTurn, resetGame } = useGame();
  const [showSettings, setShowSettings] = useState(false);
  const [selectedCards, setSelectedCards] = useState<CardType[]>([]);
  const [pendingPlacements, setPendingPlacements] = useState<Array<{ card: CardType; position: Coordinate }>>([]);
  const [nextCardIndex, setNextCardIndex] = useState(0);

  // Clear selections when turn changes
  useEffect(() => {
    if (gameState) {
      setSelectedCards([]);
      setPendingPlacements([]);
      setNextCardIndex(0);
    }
  }, [gameState?.currentPlayerIndex]);

  const handleStartGame = (playerNames: string[], gameMode: GameMode) => {
    startGame(playerNames, gameMode, settings);
    setSelectedCards([]);
    setPendingPlacements([]);
  };

  const handleCardSelect = (card: CardType) => {
    if (selectedCards.includes(card)) {
      setSelectedCards(selectedCards.filter(c => c !== card));
    } else if (selectedCards.length < 4) {
      setSelectedCards([...selectedCards, card]);
    }
  };

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

    const placements = pendingPlacements.map(p => ({
      card: p.card,
      position: p.position,
    }));

    const result = placeCards(placements);
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

  if (showSettings) {
    return (
      <div>
        <button onClick={() => setShowSettings(false)}>Back to Game</button>
        <Settings />
      </div>
    );
  }

  if (!gameState) {
    return (
      <div>
        <div style={{ textAlign: 'right', padding: '1rem' }}>
          <button onClick={() => setShowSettings(true)}>Settings</button>
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
        <h2>Winner: {winner.name} with {winner.score} points</h2>
        <ScoreDisplay gameState={gameState} />
        <button onClick={resetGame} style={{ marginTop: '1rem' }}>
          New Game
        </button>
      </div>
    );
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ textAlign: 'right', padding: '1rem' }}>
        <button onClick={() => setShowSettings(true)}>Settings</button>
      </div>
      
      <ScoreDisplay gameState={gameState} />
      
      <GameControls
        gameState={gameState}
        onPass={handlePass}
        onNewGame={resetGame}
      />

      <GameBoard
        grid={gameState.grid}
        selectedCards={selectedCards}
        pendingPlacements={pendingPlacements}
        nextCardIndex={nextCardIndex}
        onPlaceCard={handlePlaceCard}
        settings={settings}
      />

      {currentPlayer && (
        <PlayerHand
          cards={currentPlayer.hand}
          onCardSelect={handleCardSelect}
          selectedCards={selectedCards}
          onSelectionChange={setSelectedCards}
        />
      )}

      {/* Preview mode controls - reserved space */}
      <div style={{
        minHeight: '80px',
        padding: '1rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        visibility: pendingPlacements.length > 0 ? 'visible' : 'hidden',
      }}>
        <div style={{
          display: 'flex',
          gap: '1rem',
          padding: '1rem',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            color: 'var(--text-primary)',
            marginRight: '1rem'
          }}>
            <span>Preview: {pendingPlacements.length} of {selectedCards.length} cards placed</span>
            {nextCardIndex < selectedCards.length && (
              <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                (Next: {selectedCards[nextCardIndex].getEffectiveShape()} {selectedCards[nextCardIndex].getEffectiveNumber()} {selectedCards[nextCardIndex].getEffectiveColor()})
              </span>
            )}
          </div>
          {pendingPlacements.length === selectedCards.length && (
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
          )}
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

