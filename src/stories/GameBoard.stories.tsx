import type { Meta, StoryObj } from '@storybook/react';
import { GameBoard } from '../components/GameBoard/GameBoard';
import { Grid } from '../game/Grid';
import { Card } from '../game/Card';
import { SettingsProvider } from '../context/SettingsContext';
import { ThemeProvider } from '../context/ThemeContext';

const meta: Meta<typeof GameBoard> = {
  title: 'Components/GameBoard',
  component: GameBoard,
  decorators: [
    (Story) => (
      <SettingsProvider>
        <ThemeProvider>
          <Story />
        </ThemeProvider>
      </SettingsProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof GameBoard>;

export const Empty: Story = {
  args: {
    grid: new Grid(),
    selectedCards: [],
    onPlaceCard: () => {},
  },
};

export const WithStarterCard: Story = {
  args: {
    grid: (() => {
      const grid = new Grid();
      grid.setStarterCard(0, 0, new Card('Square', 1, 'Red'));
      return grid;
    })(),
    selectedCards: [],
    onPlaceCard: () => {},
  },
};

export const WithLine: Story = {
  args: {
    grid: (() => {
      const grid = new Grid();
      grid.setStarterCard(0, 0, new Card('Square', 1, 'Red'));
      grid.addCard(1, 0, new Card('Square', 2, 'Red'));
      grid.addCard(2, 0, new Card('Square', 3, 'Red'));
      return grid;
    })(),
    selectedCards: [],
    onPlaceCard: () => {},
  },
};

export const WithSelectedCards: Story = {
  args: {
    grid: (() => {
      const grid = new Grid();
      grid.setStarterCard(0, 0, new Card('Square', 1, 'Red'));
      return grid;
    })(),
    selectedCards: [new Card('Square', 2, 'Red'), new Card('Square', 3, 'Blue')],
    onPlaceCard: () => {},
  },
};
