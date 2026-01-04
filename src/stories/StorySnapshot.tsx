import React from 'react';
import { action } from '@storybook/addon-actions';
import { SettingsProvider } from '@/context/SettingsContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { GameRenderer } from '@/components/GameRenderer/GameRenderer';
import { deserializeGameState } from '@/utils/gamePersistence';
import type { SerializableGameState } from '@/utils/gamePersistence';
import type { Card as CardType } from '@/game/Card';
import type { WildValue } from '@/types/Card.types';
import type { Coordinate } from '@/types/Grid.types';

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

  // Wire up Storybook actions for all GameRenderer props
  const actions = {
    onSelectCard: action('onSelectCard') as (card: CardType, index: number) => void,
    onPlaceCard: action('onPlaceCard') as (position: Coordinate) => void,
    onConfirmTurn: action('onConfirmTurn'),
    onCancelPreview: action('onCancelPreview'),
    onDiscard: action('onDiscard'),
    onPass: action('onPass'),
    onNewGame: action('onNewGame'),
    onExport: action('onExport'),
    onImport: action('onImport'),
  };

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
          {...actions}
        />
      </ThemeProvider>
    </SettingsProvider>
  );
}
