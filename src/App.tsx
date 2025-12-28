import { useState } from 'react';
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

  const handlePlaceCard = (card: CardType, position: Coordinate) => {
    if (!gameState) return;

    const newPlacements = [...pendingPlacements, { card, position }];
    setPendingPlacements(newPlacements);

    // If we've placed all selected cards, validate and place them
    if (newPlacements.length === selectedCards.length) {
      const placements = newPlacements.map(p => ({
        card: p.card,
        position: p.position,
      }));

      const result = placeCards(placements);
      if (result.success) {
        setSelectedCards([]);
        setPendingPlacements([]);
      } else {
        // Show error and reset
        alert(result.error || 'Invalid placement');
        setPendingPlacements([]);
      }
    }
  };

  const handlePass = () => {
    passTurn();
    setSelectedCards([]);
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
        onPlaceCard={handlePlaceCard}
      />

      {currentPlayer && (
        <PlayerHand
          cards={currentPlayer.hand}
          onCardSelect={handleCardSelect}
        />
      )}
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

