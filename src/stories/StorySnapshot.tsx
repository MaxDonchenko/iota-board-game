import React from 'react';
import { SettingsProvider } from '@/context/SettingsContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { GameRenderer } from '@/components/GameRenderer/GameRenderer';
import { deserializeGameState } from '@/utils/gamePersistence';
import type { SerializableGameState } from '@/utils/gamePersistence';
import type { Card as CardType } from '@/game/Card';
import type { WildValue } from '@/types/Card.types';

interface StorySnapshotProps {
  gameState: SerializableGameState;
}

/**
 * Renders a complete game snapshot with a given game state
 * This allows stories to show the entire game UI as it would appear to a real user
 */
export function StorySnapshot({ gameState: serializedState }: StorySnapshotProps) {
  const gameState = deserializeGameState(serializedState);
  const [selectedCards] = React.useState<CardType[]>([]);
  const [pendingPlacements] = React.useState<
    Array<{ card: CardType; position: { x: number; y: number }; wildValue?: WildValue }>
  >([]);

  const noop = () => {};

  return (
    <SettingsProvider>
      <ThemeProvider>
        <GameRenderer
          gameState={gameState}
          selectedCards={selectedCards}
          pendingPlacements={pendingPlacements}
          nextCardIndex={-1}
          isMyTurn={true}
          isAITurn={false}
          onSelectCard={noop}
          onPlaceCard={noop}
          onConfirmTurn={noop}
          onCancelPreview={noop}
          onDiscard={noop}
          onPass={noop}
          onNewGame={noop}
          onExport={noop}
          onImport={noop}
        />
      </ThemeProvider>
    </SettingsProvider>
  );
}
