import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGameImplementation } from '@/hooks/useGame';
import { RoutingService } from '@/services/routing/RoutingService';
import { loadGameFromStorage } from '@/utils/gamePersistence';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import type { GameState, GamePhase } from '@/types/Game.types';
import { Grid } from '@/game/Grid';
import { Deck } from '@/game/Deck';
import { Card } from '@/game/Card';

// Mock dependecies
vi.mock('@/services/routing/RoutingService', () => ({
  RoutingService: {
    getGameIdFromUrl: vi.fn(),
    setGameIdInUrl: vi.fn(),
    removeGameIdFromUrl: vi.fn(),
  },
}));

vi.mock('@/utils/gamePersistence', () => ({
  loadGameFromStorage: vi.fn(),
  saveGameToStorage: vi.fn(),
  generateGameId: vi.fn(() => 'test-game-id'),
  deserializeGameState: vi.fn((s) => s), // Mocked to return input
  serializeGameState: vi.fn((s) => s),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

const createMockGameState = (phase: GamePhase, score = 0, gridCount = 1): GameState => {
  const grid = new Grid();
  // starter card at (0,0)
  grid.setStarterCard(0, 0, new Card('Square', 1, 'Red'));

  if (gridCount > 1) {
    for (let i = 1; i < gridCount; i++) {
      grid.positions.set(`${i},0`, new Card('Square', 1, 'Red'));
    }
  }

  return {
    phase,
    currentPlayerIndex: 0,
    players: [{ id: '1', name: 'Test Player', hand: [], score, color: 'red' }],
    grid,
    deck: new Deck('full'),
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
    gameMode: 'full',
    turnPhase: 'cardPlacement',
    isFinalTurn: false,
  };
};

describe('useGameImplementation - importGame confirmation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.confirm = vi.fn(() => true);
    // Ensure we have a default return for common calls
    vi.mocked(RoutingService.getGameIdFromUrl).mockReturnValue('test-id');
  });

  it('should NOT ask for confirmation on import if current game is ended', () => {
    vi.mocked(loadGameFromStorage).mockReturnValue(createMockGameState('ended'));

    const { result } = renderHook(() => useGameImplementation(), { wrapper });

    act(() => {
      result.current.importGame(JSON.stringify(createMockGameState('playing')));
    });

    expect(window.confirm).not.toHaveBeenCalled();
  });

  it('should ask for confirmation on import if game is "touched" (score > 0)', () => {
    vi.mocked(loadGameFromStorage).mockReturnValue(createMockGameState('playing', 10, 1));

    const { result } = renderHook(() => useGameImplementation(), { wrapper });

    act(() => {
      result.current.importGame(JSON.stringify(createMockGameState('playing')));
    });

    expect(window.confirm).toHaveBeenCalled();
  });

  it('should ask for confirmation on import if game is "touched" (more than 1 card)', () => {
    vi.mocked(loadGameFromStorage).mockReturnValue(createMockGameState('playing', 0, 2));

    const { result } = renderHook(() => useGameImplementation(), { wrapper });

    act(() => {
      result.current.importGame(JSON.stringify(createMockGameState('playing')));
    });

    expect(window.confirm).toHaveBeenCalled();
  });

  it('should NOT ask for confirmation on import if game is "untouched"', () => {
    vi.mocked(loadGameFromStorage).mockReturnValue(createMockGameState('playing', 0, 1));

    const { result } = renderHook(() => useGameImplementation(), { wrapper });

    act(() => {
      result.current.importGame(JSON.stringify(createMockGameState('playing')));
    });

    expect(window.confirm).not.toHaveBeenCalled();
  });

  it('should NOT ask for confirmation if no game is active', () => {
    vi.mocked(RoutingService.getGameIdFromUrl).mockReturnValue(null);
    vi.mocked(loadGameFromStorage).mockReturnValue(null);

    const { result } = renderHook(() => useGameImplementation(), { wrapper });

    act(() => {
      result.current.importGame(JSON.stringify(createMockGameState('playing')));
    });

    expect(window.confirm).not.toHaveBeenCalled();
  });
});
