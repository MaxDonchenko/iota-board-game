import { useState, useCallback } from 'react';
import type { Card } from '@/game/Card';

interface UseCardSelectionReturn {
  selectedCards: Card[];
  selectCard: (card: Card) => void;
  deselectCard: (card: Card) => void;
  clearSelection: () => void;
  isSelected: (card: Card) => boolean;
}

export function useCardSelection(maxSelection = 4): UseCardSelectionReturn {
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);

  const selectCard = useCallback((card: Card) => {
    setSelectedCards(prev => {
      if (prev.includes(card)) {
        return prev;
      }
      if (prev.length >= maxSelection) {
        return prev;
      }
      return [...prev, card];
    });
  }, [maxSelection]);

  const deselectCard = useCallback((card: Card) => {
    setSelectedCards(prev => prev.filter(c => c !== card));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedCards([]);
  }, []);

  const isSelected = useCallback((card: Card) => {
    return selectedCards.includes(card);
  }, [selectedCards]);

  return {
    selectedCards,
    selectCard,
    deselectCard,
    clearSelection,
    isSelected,
  };
}

