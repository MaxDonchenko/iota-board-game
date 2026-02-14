import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { SettingsProvider, useSettings } from '../context/SettingsContext';
import { ThemeProvider } from '../context/ThemeContext';
import { GameBoard } from '../components/GameBoard/GameBoard';
import { PlayerHand } from '../components/PlayerHand/PlayerHand';
import { ScoreDisplay } from '../components/ScoreDisplay/ScoreDisplay';
import { Card } from '../components/Card/Card';
import { Grid } from '../game/Grid';
import { Deck } from '../game/Deck';
import { GameStateManager } from '../game/GameState';
import { Card as CardClass } from '../game/Card';
import type { GameState } from '../types/Game.types';
import type { WildValue } from '../types/Card.types';

const meta: Meta = {
  title: 'DevMode/GameStates',
};

export default meta;

function ThemeSync({ children }: { children: React.ReactNode }) {
  const { settings, updateSettings } = useSettings();

  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      const theme = document.documentElement.getAttribute('data-theme') as 'light' | 'dark' | null;
      if (theme && theme !== settings.theme) {
        updateSettings({ theme });
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => observer.disconnect();
  }, [settings.theme]); // Remove updateSettings from dependencies

  return <>{children}</>;
}

// Wildcard Confirmation Story
function WildcardConfirmationStory() {
  const grid = new Grid();
  const deck = new Deck('full');

  // Place starter card
  const starterCard = new CardClass('Square', 1, 'Red');
  grid.setStarterCard(0, 0, starterCard);

  // Create a line where wildcard can be placed
  grid.addCard(1, 0, new CardClass('Square', 2, 'Red'));
  grid.addCard(2, 0, new CardClass('Square', 3, 'Red'));

  const wildcard = new CardClass('Square', 1, 'Red', true);
  const [selectedWildValue, setSelectedWildValue] = useState<WildValue | null>(null);

  // Valid values for the wildcard at position (3, 0)
  const validValues: WildValue[] = [
    { shape: 'Square', number: 4, color: 'Red' },
    { shape: 'Circle', number: 1, color: 'Red' },
    { shape: 'Triangle', number: 1, color: 'Red' },
    { shape: 'Plus', number: 1, color: 'Red' },
  ];

  return (
    <ThemeSync>
      <div style={{ padding: '2rem' }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Wildcard Confirmation
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          When placing a wildcard, you must select which card value it represents. Here are the
          valid options for a wildcard placed at position (3, 0) in a line of Red Squares.
        </p>

        <div style={{ marginBottom: '2rem' }}>
          <GameBoard
            grid={grid}
            selectedCards={[wildcard]}
            pendingPlacements={[
              {
                card: wildcard,
                position: { x: 3, y: 0 },
                wildValue: selectedWildValue || undefined,
              },
            ]}
            nextCardIndex={0}
            onPlaceCard={() => {}}
          />
        </div>

        <div
          style={{
            padding: '1rem',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '8px',
            marginBottom: '2rem',
          }}
        >
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Select Wildcard Value:
          </h3>
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {validValues.map((value, idx) => {
              const isSelected =
                selectedWildValue &&
                selectedWildValue.shape === value.shape &&
                selectedWildValue.number === value.number &&
                selectedWildValue.color === value.color;

              const tempCard = new CardClass(value.shape, value.number, value.color, false);

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedWildValue(value)}
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
                  <Card card={tempCard} />
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
      </div>
    </ThemeSync>
  );
}

// Game Ended Story
function GameEndedStory() {
  const grid = new Grid();
  const deck = new Deck('full');

  const starterCard = new CardClass('Square', 1, 'Red');
  grid.setStarterCard(0, 0, starterCard);

  // Create a filled grid
  for (let x = 0; x < 4; x++) {
    for (let y = 0; y < 4; y++) {
      if (x === 0 && y === 0) continue;
      grid.addCard(x, y, new CardClass('Square', (((x + y) % 4) + 1) as 1 | 2 | 3 | 4, 'Red'));
    }
  }

  const gameState: GameState = {
    phase: 'ended',
    currentPlayerIndex: 0,
    turnPhase: 'cardPlacement',
    players: [
      { id: 'player-0', name: 'Player 1', hand: [], score: 45 },
      { id: 'player-1', name: 'Player 2', hand: [], score: 32 },
    ],
    grid,
    deck,
    isFinalTurn: false,
    gameMode: 'full',
    settings: {
      theme: 'light',
      useGradients: true,
      gameMode: 'full',
      showInvalidPlacements: false,
      wildcardVariant: 'modern',
      cardVariant: 'modern',
    },
  };

  return (
    <ThemeSync>
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1 style={{ color: 'var(--text-primary)' }}>Game Over!</h1>
        <h2 style={{ color: 'var(--text-primary)' }}>
          Winner: {gameState.players[0].name} with {gameState.players[0].score} points
        </h2>
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
          <ScoreDisplay gameState={gameState} />
        </div>
      </div>
    </ThemeSync>
  );
}

// Final Turn Story
function FinalTurnStory() {
  const grid = new Grid();
  const deck = new Deck('full');

  const starterCard = new CardClass('Square', 1, 'Red');
  grid.setStarterCard(0, 0, starterCard);

  // Create a mostly filled grid
  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      if (x === 0 && y === 0) continue;
      grid.addCard(x, y, new CardClass('Square', (((x + y) % 4) + 1) as 1 | 2 | 3 | 4, 'Red'));
    }
  }

  // Empty deck to trigger final turn
  deck.drawPile = [];

  const gameState: GameState = {
    phase: 'playing',
    currentPlayerIndex: 0,
    turnPhase: 'cardPlacement',
    players: [
      {
        id: 'player-0',
        name: 'Player 1',
        hand: [new CardClass('Square', 4, 'Red'), new CardClass('Circle', 1, 'Blue')],
        score: 25,
      },
      { id: 'player-1', name: 'Player 2', hand: [], score: 18 },
    ],
    grid,
    deck,
    isFinalTurn: true,
    gameMode: 'full',
    settings: {
      theme: 'light',
      useGradients: true,
      gameMode: 'full',
      showInvalidPlacements: false,
      wildcardVariant: 'modern',
      cardVariant: 'modern',
    },
  };

  return (
    <ThemeSync>
      <div style={{ padding: '2rem' }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Final Turn</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          The draw pile is empty. This is the final turn - scores will be doubled!
        </p>
        {gameState.isFinalTurn && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#FFC55B',
              color: '#000',
              borderRadius: '8px',
              marginBottom: '2rem',
              fontWeight: 'bold',
            }}
          >
            Final Turn - Score Doubled!
          </div>
        )}
        <div style={{ marginBottom: '2rem' }}>
          <GameBoard grid={grid} selectedCards={[]} onPlaceCard={() => {}} />
        </div>
        <div style={{ marginBottom: '2rem' }}>
          <ScoreDisplay gameState={gameState} />
        </div>
        <div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Player Hand:</h3>
          <PlayerHand cards={gameState.players[0].hand} />
        </div>
      </div>
    </ThemeSync>
  );
}

// Wildcard Recycle Phase Story
function WildcardRecycleStory() {
  const grid = new Grid();
  const deck = new Deck('full');

  const starterCard = new CardClass('Square', 1, 'Red');
  grid.setStarterCard(0, 0, starterCard);

  // Place a wildcard on the grid
  const wildcard = new CardClass('Square', 1, 'Red', true);
  wildcard.wildValue = { shape: 'Square', number: 2, color: 'Red' };
  grid.addCard(1, 0, wildcard);

  const gameState: GameState = {
    phase: 'playing',
    currentPlayerIndex: 0,
    turnPhase: 'wildCardRecycle',
    players: [
      {
        id: 'player-0',
        name: 'Player 1',
        hand: [
          new CardClass('Square', 2, 'Red'), // Matching card to replace wildcard
          new CardClass('Circle', 1, 'Blue'),
        ],
        score: 15,
      },
    ],
    grid,
    deck,
    isFinalTurn: false,
    gameMode: 'full',
    settings: {
      theme: 'light',
      useGradients: true,
      gameMode: 'full',
      showInvalidPlacements: false,
      wildcardVariant: 'modern',
      cardVariant: 'modern',
    },
  };

  return (
    <ThemeSync>
      <div style={{ padding: '2rem' }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Wildcard Recycle Phase
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          You can replace a wildcard on the board with a matching real card from your hand.
        </p>
        <div style={{ marginBottom: '2rem' }}>
          <p>Game controls would appear here (Pass, Discard, etc)</p>
        </div>
        <div style={{ marginBottom: '2rem' }}>
          <GameBoard grid={grid} selectedCards={[]} onPlaceCard={() => {}} />
        </div>
        <div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Your Hand:</h3>
          <PlayerHand cards={gameState.players[0].hand} />
        </div>
      </div>
    </ThemeSync>
  );
}

function ThreefoldRepetitionStory() {
  const [gameState] = useState<GameState>(() => {
    const initial = GameStateManager.createInitialState(
      [
        { name: 'Player 1', color: 'red' },
        { name: 'Player 2', color: 'blue' },
      ],
      'full',
      {
        theme: 'light',
        useGradients: true,
        gameMode: 'full',
        showInvalidPlacements: false,
        wildcardVariant: 'modern',
        cardVariant: 'modern',
        enableWildcards: true,
        triggerFinalRound: false,
      }
    );

    initial.players.forEach((p) => (p.passCount = 3));
    initial.phase = 'draw';
    initial.turnPhase = 'pass';
    return initial;
  });

  return (
    <ThemeSync>
      <div style={{ padding: '2rem' }}>
        <h1 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Threefold Repetition — Draw State
        </h1>

        <div style={{ marginBottom: '2rem' }}>
          <GameBoard grid={gameState.grid} selectedCards={[]} onPlaceCard={() => {}} />
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <ScoreDisplay gameState={gameState} />
        </div>
      </div>
    </ThemeSync>
  );
}

const ThreefoldRepetition: StoryObj = {
  render: () => (
    <SettingsProvider>
      <ThemeProvider>
        <ThreefoldRepetitionStory />
      </ThemeProvider>
    </SettingsProvider>
  ),
};

export const WildcardConfirmation: StoryObj = {
  render: () => (
    <SettingsProvider>
      <ThemeProvider>
        <WildcardConfirmationStory />
      </ThemeProvider>
    </SettingsProvider>
  ),
};

export const GameEnded: StoryObj = {
  render: () => (
    <SettingsProvider>
      <ThemeProvider>
        <GameEndedStory />
      </ThemeProvider>
    </SettingsProvider>
  ),
};

export const FinalTurn: StoryObj = {
  render: () => (
    <SettingsProvider>
      <ThemeProvider>
        <FinalTurnStory />
      </ThemeProvider>
    </SettingsProvider>
  ),
};

export const WildcardRecycle: StoryObj = {
  render: () => (
    <SettingsProvider>
      <ThemeProvider>
        <WildcardRecycleStory />
      </ThemeProvider>
    </SettingsProvider>
  ),
};

export { ThreefoldRepetition };
