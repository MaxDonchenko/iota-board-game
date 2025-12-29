import { render, fireEvent } from '@testing-library/react';
import { describe, it, vi, expect } from 'vitest';
import { PlayerHand } from '@/components/PlayerHand/PlayerHand';
import { SettingsProvider } from '@/context/SettingsContext';
import { Card as CardModel } from '@/game/Card';

describe('PlayerHand', () => {
  it('calls handlers when a card is clicked', () => {
    const c1 = new CardModel('Square', 1, 'Red');
    const c2 = new CardModel('Circle', 2, 'Blue');

    const onCardSelect = vi.fn();
    const onSelectionChange = vi.fn();

    const { getByTestId } = render(
      <SettingsProvider>
        <PlayerHand
          cards={[c1, c2]}
          onCardSelect={onCardSelect}
          selectedCards={[]}
          onSelectionChange={onSelectionChange}
        />
      </SettingsProvider>
    );

    const card0 = getByTestId('hand-card-0');
    fireEvent.click(card0);

    expect(onSelectionChange).toHaveBeenCalled();
    expect(onCardSelect).toHaveBeenCalledWith(c1);
  });
});
