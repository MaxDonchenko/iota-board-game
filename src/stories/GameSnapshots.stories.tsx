import type { Meta, StoryObj } from '@storybook/react';
import { StorySnapshot } from './StorySnapshot';
import { drawByThreefoldRepetitionGameState, storyGameStates } from './storyData';

const meta: Meta<typeof StorySnapshot> = {
  title: 'GameStates',
  component: StorySnapshot,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const InitialGame: Story = {
  args: {
    gameState: storyGameStates.initialGame,
  },
};

export const DrawByThreefoldRepetition: Story = {
  args: {
    gameState: drawByThreefoldRepetitionGameState,
  },
};

export const GameOver: Story = {
  args: {
    gameState: storyGameStates.gameOver,
  },
};
