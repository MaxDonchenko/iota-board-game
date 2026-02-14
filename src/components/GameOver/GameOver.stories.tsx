import type { Meta, StoryObj } from '@storybook/react';
import { GameOver } from './GameOver';
import { Grid } from '@/game/Grid';
import { Deck } from '@/game/Deck';
import type { GameState } from '@/types/Game.types';

const meta: Meta<typeof GameOver> = {
  title: 'Components/GameOver',
  component: GameOver,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof GameOver>;

const mockGameState: GameState = {
  phase: 'ended',
  players: [
    { id: '1', name: 'Player 1', score: 124, hand: [], color: '#61bb46' },
    { id: '2', name: 'Player 2', score: 98, hand: [], color: '#2b95ff' },
  ],
  grid: new Grid(),
  deck: new Deck('short'),
  currentPlayerIndex: 0,
  turnPhase: 'cardPlacement',
  isFinalTurn: true,
  gameMode: 'short',
  settings: {
    theme: 'dark',
    useGradients: true,
    gameMode: 'short',
    showInvalidPlacements: true,
    wildcardVariant: 'modern',
    cardVariant: 'modern',
    enableWildcards: true,
    triggerFinalRound: false,
  },
};

export const Default: Story = {
  args: {
    gameState: mockGameState,
    onNewGame: () => alert('New Game clicked'),
  },
};
