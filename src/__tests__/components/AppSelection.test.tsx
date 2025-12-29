import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from '@/App';

describe('App integration - selection', () => {
  it('selects a card after starting a game and clicking a card in hand', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // 1. On Welcome page, click "Play Hotseat"
    const playHotseatButton = screen.getByText(/Play Hotseat/i);
    fireEvent.click(playHotseatButton);

    // 2. On Setup page, click "Start Game"
    const startGameButton = await screen.findByText(/Start Game/i);
    fireEvent.click(startGameButton);

    // 3. Wait for player's hand to appear and click first card
    const card = await screen.findByTestId('hand-card-0');
    fireEvent.click(card);

    // Expect selection info to be visible
    expect(screen.getByText(/1 card selected/i)).toBeDefined();
  });
});
