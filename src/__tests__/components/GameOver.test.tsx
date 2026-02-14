import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GameOver } from '@/components/GameOver/GameOver';
import type { GameState } from '@/types/Game.types';
import { SettingsProvider } from '@/context/SettingsContext';
import { Grid } from '@/game/Grid';
import { Deck } from '@/game/Deck';

const mockGameState: GameState = {
  phase: 'ended',
  currentPlayerIndex: 0,
  turnPhase: 'cardPlacement',
  players: [
    { id: '1', name: 'Alice', score: 100, hand: [], color: 'red' },
    { id: '2', name: 'Bob', score: 100, hand: [], color: 'blue' },
    { id: '3', name: 'Charlie', score: 50, hand: [], color: 'green' },
  ],
  grid: new Grid(),
  deck: new Deck('full'),
  isFinalTurn: false,
  gameMode: 'full',
  settings: {
    theme: 'light',
    useGradients: true,
    gameMode: 'full',
    showInvalidPlacements: false,
    wildcardVariant: 'modern',
    cardVariant: 'modern',
    enableWildcards: true,
    triggerFinalRound: false,
  },
};

describe('GameOver', () => {
  it('shows multiple winners in case of a tie', () => {
    const { getByText, getByTestId } = render(
      <SettingsProvider>
        <GameOver gameState={mockGameState} onNewGame={() => {}} />
      </SettingsProvider>
    );

    expect(getByText('Winners')).toBeDefined();
    expect(getByTestId('winner-name').textContent).toBe('Alice, Bob');
    expect(getByText('100 points')).toBeDefined();
  });

  it('shows a single winner when no tie', () => {
    const singleWinnerState: GameState = {
      ...mockGameState,
      players: [
        { id: '1', name: 'Alice', score: 120, hand: [], color: 'red' },
        { id: '2', name: 'Bob', score: 100, hand: [], color: 'blue' },
      ],
    };

    const { getByText, getByTestId } = render(
      <SettingsProvider>
        <GameOver gameState={singleWinnerState} onNewGame={() => {}} />
      </SettingsProvider>
    );

    expect(getByText('Winner')).toBeDefined();
    expect(getByTestId('winner-name').textContent).toBe('Alice');
    expect(getByText('120 points')).toBeDefined();
  });
});
