import type { Meta, StoryObj } from '@storybook/react';
import { ThemeProvider } from '../context/ThemeContext';
import { GameBoard } from '../components/GameBoard/GameBoard';
import { useCases } from '../dev/gameUseCases';

const meta: Meta = {
  title: 'DevMode/UseCases',
  tags: ['autodocs'],
};

export default meta;

function UseCaseStory({ useCaseName }: { useCaseName: string }) {
  const useCase = Object.values(useCases).find(uc => uc.name === useCaseName);
  
  if (!useCase) {
    return <div>Use case not found: {useCaseName}</div>;
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h3>{useCase.name}</h3>
      <p>{useCase.description}</p>
      <GameBoard
        grid={useCase.gameState.grid}
        selectedCards={[]}
        onPlaceCard={() => {}}
      />
    </div>
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

