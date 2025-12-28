import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ThemeProvider } from '../context/ThemeContext';
import { useGame } from '../hooks/useGame';
import { useTheme } from '../context/ThemeContext';
import { GameBoard } from '../components/GameBoard/GameBoard';
import { PlayerHand } from '../components/PlayerHand/PlayerHand';
import { ScoreDisplay } from '../components/ScoreDisplay/ScoreDisplay';
import { GameControls } from '../components/GameControls/GameControls';
import { useCases } from '../dev/gameUseCases';
import type { Card as CardType } from '../game/Card';
import type { Coordinate } from '../types/Grid.types';

const meta: Meta = {
  title: 'DevMode/DevModeSelector',
  tags: ['autodocs'],
};

export default meta;

function DevModeContent() {
  const { settings } = useTheme();
  const { gameState, startGame, placeCards, passTurn, resetGame } = useGame();
  const [selectedUseCase, setSelectedUseCase] = useState<string>('');
  const [selectedCards, setSelectedCards] = useState<CardType[]>([]);
  const [pendingPlacements, setPendingPlacements] = useState<Array<{ card: CardType; position: Coordinate }>>([]);

  const handleLoadUseCase = (useCaseName: string) => {
    const useCase = Object.values(useCases).find(uc => uc.name === useCaseName);
    if (useCase) {
      // In a real implementation, you'd load the game state
      // For now, we'll just show the use case name
      setSelectedUseCase(useCaseName);
    }
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
        alert(result.error || 'Invalid placement');
        setPendingPlacements([]);
      }
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Dev Mode - Use Case Selector</h2>
      <select
        value={selectedUseCase}
        onChange={(e) => handleLoadUseCase(e.target.value)}
        style={{ marginBottom: '1rem', padding: '0.5rem' }}
      >
        <option value="">Select a use case...</option>
        {Object.values(useCases).map(useCase => (
          <option key={useCase.name} value={useCase.name}>
            {useCase.name} - {useCase.description}
          </option>
        ))}
      </select>

      {selectedUseCase && (
        <div style={{ marginTop: '1rem' }}>
          <p>Use Case: {selectedUseCase}</p>
          <button onClick={resetGame}>Reset Game</button>
        </div>
      )}

      {gameState && (
        <div style={{ marginTop: '2rem' }}>
          <ScoreDisplay gameState={gameState} />
          <GameControls
            gameState={gameState}
            onPass={() => {
              passTurn();
              setSelectedCards([]);
            }}
            onNewGame={resetGame}
          />
          <GameBoard
            grid={gameState.grid}
            selectedCards={selectedCards}
            onPlaceCard={handlePlaceCard}
          />
          {gameState.players[gameState.currentPlayerIndex] && (
            <PlayerHand
              cards={gameState.players[gameState.currentPlayerIndex].hand}
              onCardSelect={handleCardSelect}
            />
          )}
        </div>
      )}
    </div>
  );
}

export const DevModeSelector: StoryObj = {
  render: () => (
    <ThemeProvider>
      <DevModeContent />
    </ThemeProvider>
  ),
};

