import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { SettingsProvider } from '../context/SettingsContext';
import { ThemeProvider } from '../context/ThemeContext';
import { GameOver } from '../components/GameOver/GameOver';
import { Grid } from '../game/Grid';
import { Deck } from '../game/Deck';
import type { GameState } from '../types/Game.types';

const meta: Meta<typeof GameOver> = {
  title: 'Components/GameOver',
  component: GameOver,
  decorators: [
    (Story) => (
      <SettingsProvider>
        <ThemeProvider>
          <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <Story />
          </div>
        </ThemeProvider>
      </SettingsProvider>
    ),
  ],
};

export default meta;

const baseGameState: GameState = {
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

export const SingleWinner: StoryObj<typeof GameOver> = {
  args: {
    gameState: {
      ...baseGameState,
      players: [
        { id: '1', name: 'Alice', score: 120, hand: [], color: 'red' },
        { id: '2', name: 'Bob', score: 100, hand: [], color: 'blue' },
      ],
    },
    onNewGame: () => console.log('New game clicked'),
  },
};

export const TieGame: StoryObj<typeof GameOver> = {
  args: {
    gameState: baseGameState,
    onNewGame: () => console.log('New game clicked'),
  },
};

export const MultipleTie: StoryObj<typeof GameOver> = {
  args: {
    gameState: {
      ...baseGameState,
      players: [
        { id: '1', name: 'Alice', score: 100, hand: [], color: 'red' },
        { id: '2', name: 'Bob', score: 100, hand: [], color: 'blue' },
        { id: '3', name: 'Charlie', score: 100, hand: [], color: 'green' },
      ],
    },
    onNewGame: () => console.log('New game clicked'),
  },
};

export const NoMovesEnd: StoryObj<typeof GameOver> = {
  args: {
    gameState: {
      ...baseGameState,
      phase: 'ended',
      drawReason: 'no-valid-moves',
    },
    onNewGame: () => console.log('New game clicked'),
  },
};

export const ThreefoldRepetitionEnd: StoryObj<typeof GameOver> = {
  args: {
    gameState: {
      ...baseGameState,
      phase: 'ended',
      drawReason: 'threefold-repetition',
      players: [
        { id: '1', name: 'Alice', score: 150, hand: [], color: 'red' },
        { id: '2', name: 'Bob', score: 100, hand: [], color: 'blue' },
      ],
    },
    onNewGame: () => console.log('New game clicked'),
  },
};
