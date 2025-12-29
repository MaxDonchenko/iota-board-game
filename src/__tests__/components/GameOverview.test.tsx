import { serializeGameState, deserializeGameState } from '@/utils/gamePersistence';
import type { GameState } from '@/types/Game.types';
import { Grid } from '@/game/Grid';
import { Deck } from '@/game/Deck';

describe('gamePersistence startTime', () => {
  it('roundtrips startTime when serializing and deserializing', () => {
    const startTime = new Date('2025-01-01T12:34:56Z');

    const dummyState = {
      phase: 'playing',
      currentPlayerIndex: 0,
      turnPhase: 'cardPlacement',
      players: [],
      grid: new Grid(),
      deck: new Deck('short'),
      isFinalTurn: false,
      gameMode: 'short',
      settings: {
        theme: 'light',
        useGradients: false,
        gameMode: 'short',
        showInvalidPlacements: false,
        wildcardVariant: 'modern',
        cardVariant: 'modern',
      },
      startTime,
    } as unknown as GameState;

    const serialized = serializeGameState(dummyState, 'test-id');
    const deserialized = deserializeGameState(serialized);

    expect(deserialized.startTime?.toISOString()).toBe(startTime.toISOString());
  });
});
