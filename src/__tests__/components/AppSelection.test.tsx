import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '@/App';

describe('App integration - selection', () => {
  it('selects a card after starting a game and clicking a card in hand', async () => {
    render(<App />);

    // Start game using GameSetup Start button
    const startButton = screen.getByText(/Start Game/i);
    fireEvent.click(startButton);

    // Wait for player's hand to appear and click first card
    const card = await screen.findByTestId('hand-card-0');
    fireEvent.click(card);

    // Expect selection info to be visible
    expect(screen.getByText(/1 card selected/i)).toBeDefined();
  });
});
