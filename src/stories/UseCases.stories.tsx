import type { Meta, StoryObj } from '@storybook/react';
import React, { useEffect } from 'react';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { GameBoard } from '../components/GameBoard/GameBoard';
import { PlayerHand } from '../components/PlayerHand/PlayerHand';
import { useCases } from '../dev/gameUseCases';

const meta: Meta = {
  title: 'DevMode/UseCases',
};

export default meta;

function ThemeSync({ children }: { children: React.ReactNode }) {
  const { settings, updateSettings } = useTheme();
  
  useEffect(() => {
    // Sync with Storybook's theme from data-theme attribute
    const observer = new MutationObserver(() => {
      const theme = document.documentElement.getAttribute('data-theme') as 'light' | 'dark' | null;
      // Only update if theme actually changed to avoid infinite loop
      if (theme && theme !== settings.theme) {
        updateSettings({ theme });
      }
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    
    // Initial sync - only if different
    const theme = document.documentElement.getAttribute('data-theme') as 'light' | 'dark' | null;
    if (theme && theme !== settings.theme) {
      updateSettings({ theme });
    }
    
    return () => observer.disconnect();
  }, [settings.theme, updateSettings]);
  
  return <>{children}</>;
}

function UseCaseStory({ useCaseName }: { useCaseName: string }) {
  // Look up by key (e.g., "AllFourCards") instead of name property
  const useCase = useCases[useCaseName as keyof typeof useCases];
  
  if (!useCase) {
    return <div>Use case not found: {useCaseName}</div>;
  }

  // Check if gameState has a grid
  if (!useCase.gameState || !useCase.gameState.grid) {
    return (
      <div style={{ padding: '1rem' }}>
        <h3>{useCase.name}</h3>
        <p>{useCase.description}</p>
        <p style={{ color: 'orange' }}>Use case not yet implemented - gameState missing grid</p>
      </div>
    );
  }

  const currentPlayer = useCase.gameState.players[useCase.gameState.currentPlayerIndex];
  const showHand = useCaseName === 'WildCardRecycling' || useCaseName === 'AllFourCards';

  return (
    <ThemeSync>
      <div style={{ padding: '1rem' }}>
        <h3>{useCase.name}</h3>
        <p>{useCase.description}</p>
        <GameBoard
          grid={useCase.gameState.grid}
          selectedCards={[]}
          onPlaceCard={() => {}}
        />
        {showHand && currentPlayer && (
          <div style={{ marginTop: '2rem' }}>
            <h4>Player Hand:</h4>
            <PlayerHand
              cards={currentPlayer.hand}
              onCardSelect={() => {}}
            />
          </div>
        )}
      </div>
    </ThemeSync>
  );
}

export const BasicLinePlacement: StoryObj = {
  render: () => (
    <ThemeProvider>
      <UseCaseStory useCaseName="BasicLinePlacement" />
    </ThemeProvider>
  ),
};

export const LotCreation: StoryObj = {
  render: () => (
    <ThemeProvider>
      <UseCaseStory useCaseName="LotCreation" />
    </ThemeProvider>
  ),
};

export const WildCardPlacement: StoryObj = {
  render: () => (
    <ThemeProvider>
      <UseCaseStory useCaseName="WildCardPlacement" />
    </ThemeProvider>
  ),
};

export const WildCardRecycling: StoryObj = {
  render: () => (
    <ThemeProvider>
      <UseCaseStory useCaseName="WildCardRecycling" />
    </ThemeProvider>
  ),
};

export const MultiLineScoring: StoryObj = {
  render: () => (
    <ThemeProvider>
      <UseCaseStory useCaseName="MultiLineScoring" />
    </ThemeProvider>
  ),
};

export const AllFourCards: StoryObj = {
  render: () => (
    <ThemeProvider>
      <UseCaseStory useCaseName="AllFourCards" />
    </ThemeProvider>
  ),
};

export const FinalTurn: StoryObj = {
  render: () => (
    <ThemeProvider>
      <UseCaseStory useCaseName="FinalTurn" />
    </ThemeProvider>
  ),
};

export const ComplexGrid: StoryObj = {
  render: () => (
    <ThemeProvider>
      <UseCaseStory useCaseName="ComplexGrid" />
    </ThemeProvider>
  ),
};

export const ImpossiblePlacement: StoryObj = {
  render: () => (
    <ThemeProvider>
      <UseCaseStory useCaseName="ImpossiblePlacement" />
    </ThemeProvider>
  ),
};

export const EdgeCaseValidation: StoryObj = {
  render: () => (
    <ThemeProvider>
      <UseCaseStory useCaseName="EdgeCaseValidation" />
    </ThemeProvider>
  ),
};

