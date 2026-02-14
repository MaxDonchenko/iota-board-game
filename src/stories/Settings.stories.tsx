import type { Meta, StoryObj } from '@storybook/react';
import { Settings } from '../components/Settings/Settings';
import { SettingsProvider } from '../context/SettingsContext';
import { ThemeProvider } from '../context/ThemeContext';
import { GameContext } from '../context/GameContext';
import type { UseGameReturn } from '../hooks/useGame';
import type { GameState } from '../types/Game.types';
import { Grid } from '../game/Grid';
import { Deck } from '../game/Deck';

const createMockGameState = (): GameState => ({
  phase: 'playing',
  currentPlayerIndex: 0,
  turnPhase: 'cardPlacement',
  players: [],
  grid: new Grid(),
  deck: new Deck(),
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
});

const mockGameContext = (isGameActive: boolean): UseGameReturn => ({
  gameState: isGameActive ? createMockGameState() : null,
  currentPlayer: null,
  isAITurn: false,
  startGame: () => {},
  placeCards: () => ({ success: true }),
  passTurn: () => {},
  discardCards: () => ({ success: true }),
  recycleWildCard: () => ({ success: true }),
  resetGame: () => {},
  isGameActive,
  selectedCards: [],
  pendingPlacements: [],
  nextCardIndex: 0,
  selectCard: () => {},
  setSelectedCards: () => {},
  setPendingPlacements: () => {},
  placePreview: () => {},
  confirmTurn: () => {},
  cancelPreview: () => {},
  discardSelected: () => {},
  passTurnAndClear: () => {},
  resetSelection: () => {},
  getValidWildcardValues: () => [],
  setWildcardValueAtIndex: () => {},
  removePreviewPlacement: () => {},
  exportGame: () => null,
  importGame: () => ({ success: true }),
});

const meta: Meta<typeof Settings> = {
  title: 'Components/Settings',
  component: Settings,
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
type Story = StoryObj<typeof Settings>;

export const Default: Story = {
  render: () => (
    <GameContext.Provider value={mockGameContext(false)}>
      <Settings />
    </GameContext.Provider>
  ),
};

export const ActiveGame: Story = {
  render: () => (
    <GameContext.Provider value={mockGameContext(true)}>
      <Settings />
    </GameContext.Provider>
  ),
};
