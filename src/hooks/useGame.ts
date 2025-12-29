import { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { GameStateManager } from '@/game/GameState';
import { Validation } from '@/game/Validation';
import { Scoring } from '@/game/Scoring';
import { WildCardManager } from '@/game/WildCard';
import { Card } from '@/game/Card';
import { Grid } from '@/game/Grid';
import {
  generateGameId,
  saveGameToStorage,
  loadGameFromStorage,
  serializeGameState,
  deserializeGameState,
  type SerializableGameState,
} from '@/utils/gamePersistence';
import type { GameState, GameSettings } from '@/types/Game.types';
import type { Placement } from '@/game/Validation';
import type { WildCardReplacement } from '@/game/WildCard';
import type { Coordinate } from '@/types/Grid.types';
import type { WildValue } from '@/types/Card.types';

interface PreviewPlacement {
  card: Card;
  position: Coordinate;
  wildValue?: WildValue;
}

interface UseGameReturn {
  gameState: GameState | null;
  startGame: (playerNames: string[], gameMode: 'short' | 'full', settings: GameSettings) => void;
  placeCards: (
    placements: Placement[],
    cardMapping?: Map<Card, Card>
  ) => { success: boolean; error?: string };
  passTurn: (cardsToTrade?: string[]) => void;
  discardCards: (cards: Card[]) => { success: boolean; error?: string };
  recycleWildCard: (replacement: WildCardReplacement) => { success: boolean; error?: string };
  resetGame: () => void;

  // UI selection / preview helpers
  selectedCards: Card[];
  pendingPlacements: PreviewPlacement[];
  nextCardIndex: number;
  selectCard: (card: Card) => void;
  setSelectedCards: (cards: Card[]) => void;
  setPendingPlacements: (p: PreviewPlacement[]) => void;
  placePreview: (position: Coordinate) => void;
  confirmTurn: () => void;
  cancelPreview: () => void;
  discardSelected: () => void;
  passTurnAndClear: () => void;
  resetSelection: () => void;
  getValidWildcardValues: (wildCard: Card, position: Coordinate) => WildValue[];
  setWildcardValueAtIndex: (index: number, value: WildValue) => void;

  // Persistence helpers
  exportGame: () => string | null;
  importGame: (json: string) => { success: boolean; error?: string };
}

export function useGame(): UseGameReturn {
  const [gameId, setGameId] = useState<string | null>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('game');
  });

  const [gameState, setGameState] = useState<GameState | null>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const gameIdFromUrl = urlParams.get('game');
    if (gameIdFromUrl) {
      return loadGameFromStorage(gameIdFromUrl);
    }
    return null;
  });

  // UI selection state
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [pendingPlacements, setPendingPlacements] = useState<PreviewPlacement[]>([]);
  const [nextCardIndex, setNextCardIndex] = useState(0);

  // Load game from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const gameIdFromUrl = urlParams.get('game');

    if (gameIdFromUrl && gameIdFromUrl !== gameId) {
      const loadedState = loadGameFromStorage(gameIdFromUrl);
      if (loadedState) {
        setGameState(loadedState);
        setGameId(gameIdFromUrl);
      } else {
        // Clear invalid game ID from URL
        const url = new URL(window.location.href);
        url.searchParams.delete('game');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [gameId]); // Runs when gameId changes, but also we want it to run when the user navigates (popstate)

  // Also listen to popstate for back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const gameIdFromUrl = urlParams.get('game');
      if (gameIdFromUrl && gameIdFromUrl !== gameId) {
        const loadedState = loadGameFromStorage(gameIdFromUrl);
        if (loadedState) {
          setGameState(loadedState);
          setGameId(gameIdFromUrl);
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [gameId]);

  const { pathname } = useLocation();

  // Sync gameId to URL search params
  useEffect(() => {
    // Only sync game ID for game-related paths
    if (!pathname.includes('/game') && !pathname.includes('/setup')) {
      return;
    }

    const url = new URL(window.location.href);
    const idInUrl = url.searchParams.get('game');

    if (gameId && idInUrl !== gameId) {
      url.searchParams.set('game', gameId);
      window.history.replaceState({}, '', url.toString());
    } else if (!gameId && idInUrl && gameState) {
      // If we have state but no ID (shouldn't happen), or we explicitly cleared it
      url.searchParams.delete('game');
      window.history.replaceState({}, '', url.toString());
    }
  }, [gameId, gameState, pathname]);

  // Save game to storage whenever it changes
  useEffect(() => {
    if (gameState && gameId) {
      saveGameToStorage(gameState, gameId);
    }
  }, [gameState, gameId]);

  const startGame = useCallback(
    (playerNames: string[], gameMode: 'short' | 'full', settings: GameSettings) => {
      const newGameId = generateGameId();
      const newState = GameStateManager.createInitialState(playerNames, gameMode, settings);
      setGameState(newState);
      setGameId(newGameId);

      // Save to storage immediately
      saveGameToStorage(newState, newGameId);
    },
    []
  );

  const placeCards = useCallback(
    (placements: Placement[], cardMapping?: Map<Card, Card>) => {
      if (!gameState) {
        return { success: false, error: 'No game in progress' };
      }

      const validation = Validation.validatePlacement(placements, gameState.grid);
      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }

      // Place cards on grid
      for (const placement of placements) {
        gameState.grid.addCard(placement.position.x, placement.position.y, placement.card);
      }

      // Calculate score
      const affectedLines = gameState.grid
        .getAllLines()
        .filter((line) =>
          line.positions.some((pos) =>
            placements.some((p) => p.position.x === pos.x && p.position.y === pos.y)
          )
        );

      const scoreResult = Scoring.calculateTurnScore(
        affectedLines,
        placements.length,
        gameState.isFinalTurn
      );

      // Update player score
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      const newState = GameStateManager.updatePlayerScore(
        gameState,
        currentPlayer.id,
        scoreResult.finalScore
      );

      // Remove placed cards from hand
      // For wildcards that were replaced, use the mapping to find original card
      const updatedPlayers = newState.players.map((p, idx) => {
        if (idx === gameState.currentPlayerIndex) {
          return {
            ...p,
            hand: p.hand.filter((card) => {
              // Check if this card was placed
              return !placements.some((pl) => {
                // If there's a mapping, check if this card is the original for a replaced wildcard
                if (cardMapping && cardMapping.has(pl.card)) {
                  const originalCard = cardMapping.get(pl.card);
                  return originalCard === card;
                }
                // For regular cards, match by reference
                return pl.card === card;
              });
            }),
          };
        }
        return p;
      });

      // Refill hand
      const finalState = GameStateManager.refillHand(
        { ...newState, players: updatedPlayers },
        currentPlayer.id
      );

      // Check game end
      const isGameEnd = GameStateManager.checkGameEnd(finalState);
      if (isGameEnd) {
        setGameState({ ...finalState, phase: 'ended' });
      } else {
        setGameState(GameStateManager.nextTurn(finalState));
      }

      return { success: true };
    },
    [gameState]
  );

  const passTurn = useCallback(
    (cardsToTrade: string[] = []) => {
      if (!gameState) {
        return;
      }

      const currentPlayer = gameState.players[gameState.currentPlayerIndex];

      // Trade cards if specified
      if (cardsToTrade.length > 0) {
        const cardsToRemove = currentPlayer.hand.filter((_, idx) =>
          cardsToTrade.includes(idx.toString())
        );

        // Return cards to bottom of draw pile
        for (const card of cardsToRemove) {
          gameState.deck.addToDrawPile(card);
        }

        // Remove from hand
        const updatedHand = currentPlayer.hand.filter((card) => !cardsToRemove.includes(card));

        // Draw replacements
        const newCards = gameState.deck.dealCards(cardsToRemove.length);

        const updatedPlayers = gameState.players.map((p, idx) => {
          if (idx === gameState.currentPlayerIndex) {
            return { ...p, hand: [...updatedHand, ...newCards] };
          }
          return p;
        });

        setGameState({
          ...gameState,
          players: updatedPlayers,
        });
      }

      // Move to next turn
      setGameState(GameStateManager.nextTurn(gameState));
    },
    [gameState]
  );

  const recycleWildCard = useCallback(
    (replacement: WildCardReplacement) => {
      if (!gameState) {
        return { success: false, error: 'No game in progress' };
      }

      if (
        !Validation.canReplaceWild(
          replacement.wildCard,
          replacement.replacementCard,
          gameState.grid
        )
      ) {
        return { success: false, error: 'Cannot replace wild card' };
      }

      try {
        const wildCard = WildCardManager.replaceWild(replacement, gameState.grid);

        // Add wild card to player's hand
        const updatedPlayers = gameState.players.map((p, idx) => {
          if (idx === gameState.currentPlayerIndex) {
            return { ...p, hand: [...p.hand, wildCard] };
          }
          return p;
        });

        // Remove replacement card from hand
        const finalPlayers = updatedPlayers.map((p, idx) => {
          if (idx === gameState.currentPlayerIndex) {
            return {
              ...p,
              hand: p.hand.filter((c) => c !== replacement.replacementCard),
            };
          }
          return p;
        });

        setGameState({
          ...gameState,
          players: finalPlayers,
        });

        return { success: true };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    },
    [gameState]
  );

  const discardCards = useCallback(
    (cards: Card[]) => {
      if (!gameState) {
        return { success: false, error: 'No game in progress' };
      }

      const currentPlayer = gameState.players[gameState.currentPlayerIndex];

      // Verify all cards are in player's hand
      const cardsToDiscard = cards.filter((card) => currentPlayer.hand.includes(card));
      if (cardsToDiscard.length === 0) {
        return { success: false, error: 'No valid cards to discard' };
      }

      // Return cards to bottom of draw pile (addToDrawPile adds to the end of the array)
      for (const card of cardsToDiscard) {
        gameState.deck.drawPile.unshift(card); // Add to bottom (beginning) of draw pile
      }

      // Remove from hand
      const updatedHand = currentPlayer.hand.filter((card) => !cardsToDiscard.includes(card));

      // Draw replacements from top (dealCards uses pop, which takes from the end)
      const newCards = gameState.deck.dealCards(cardsToDiscard.length);

      const updatedPlayers = gameState.players.map((p, idx) => {
        if (idx === gameState.currentPlayerIndex) {
          return { ...p, hand: [...updatedHand, ...newCards] };
        }
        return p;
      });

      // Move to next turn
      const newState = GameStateManager.nextTurn({
        ...gameState,
        players: updatedPlayers,
      });

      setGameState(newState);

      return { success: true };
    },
    [gameState]
  );

  const resetGame = useCallback(() => {
    setGameState(null);
    setGameId(null);

    // Clear URL
    window.history.replaceState({}, '', window.location.pathname);

    // Clear from storage
    if (gameId) {
      localStorage.removeItem(`iota-game-${gameId}`);
    }
  }, [gameId]);

  // ----- UI selection helpers -----
  const selectCard = useCallback((card: Card) => {
    // console.log for debug during tests
    console.log('selectCard called', card && card.toString && card.toString());
    setSelectedCards((current: Card[]) => {
      if (current.includes(card)) {
        return current.filter((c) => c !== card);
      }
      if (current.length < 4) {
        return [...current, card];
      }
      return current;
    });
  }, []);

  const placePreview = useCallback(
    (position: Coordinate) => {
      if (!gameState || selectedCards.length === 0) return;
      if (nextCardIndex >= selectedCards.length) return;

      const card = selectedCards[nextCardIndex];
      const newPlacements = [...pendingPlacements, { card, position }];
      setPendingPlacements(newPlacements);
      setNextCardIndex(nextCardIndex + 1);
    },
    [gameState, selectedCards, nextCardIndex, pendingPlacements]
  );

  const confirmTurn = useCallback(() => {
    if (!gameState || pendingPlacements.length === 0) return;

    const cardMapping = new Map<Card, Card>();
    const placements = pendingPlacements.map((p: PreviewPlacement) => {
      let card = p.card;
      const originalCard = p.card;
      if (card.isWild && p.wildValue) {
        card = new Card(p.wildValue.shape, p.wildValue.number, p.wildValue.color, false);
        cardMapping.set(card, originalCard);
      }
      return { card, position: p.position };
    });

    const result = placeCards(placements, cardMapping);
    if (result.success) {
      setSelectedCards([]);
      setPendingPlacements([]);
      setNextCardIndex(0);
    } else {
      alert(result.error || 'Invalid placement');
      setPendingPlacements([]);
      setNextCardIndex(0);
    }
  }, [gameState, pendingPlacements, placeCards]);

  const cancelPreview = useCallback(() => {
    setPendingPlacements([]);
    setNextCardIndex(0);
  }, []);

  const passTurnAndClear = useCallback(() => {
    passTurn();
    setSelectedCards([]);
    setPendingPlacements([]);
    setNextCardIndex(0);
  }, [passTurn]);

  const discardSelected = useCallback(() => {
    if (selectedCards.length === 0) return;
    const hasWildcard = selectedCards.some((card) => card.isWild);
    if (hasWildcard) {
      const confirmed = window.confirm(
        'Warning: You are about to discard a wildcard, which is a rare and valuable card.\n\n' +
          'Are you sure you want to proceed?'
      );
      if (!confirmed) return;
    }

    const result = discardCards(selectedCards);
    if (result.success) {
      setSelectedCards([]);
      setPendingPlacements([]);
      setNextCardIndex(0);
    } else {
      alert(result.error || 'Failed to discard cards');
    }
  }, [selectedCards, discardCards]);

  const resetSelection = useCallback(() => {
    setSelectedCards([]);
    setPendingPlacements([]);
    setNextCardIndex(0);
  }, []);

  const setWildcardValueAtIndex = useCallback((index: number, value: WildValue) => {
    setPendingPlacements((current) =>
      current.map((p, i) => (i === index ? { ...p, wildValue: value } : p))
    );
  }, []);

  const getCompleteLineForWildcard = useCallback(
    (
      position: Coordinate,
      direction: 'horizontal' | 'vertical',
      grid: Grid,
      wildCard: Card
    ): { cards: Card[]; positions: Coordinate[] } | null => {
      const allCards = new Map<string, Card>();

      for (const [key, card] of grid.positions.entries()) {
        allCards.set(key, card);
      }

      allCards.set(`${position.x},${position.y}`, wildCard);

      const positions: Coordinate[] = [position];
      const cards: Card[] = [wildCard];

      if (direction === 'horizontal') {
        let leftX = position.x - 1;
        while (allCards.has(`${leftX},${position.y}`)) {
          const card = allCards.get(`${leftX},${position.y}`);
          if (card) {
            positions.unshift({ x: leftX, y: position.y });
            cards.unshift(card);
          }
          leftX--;
        }

        let rightX = position.x + 1;
        while (allCards.has(`${rightX},${position.y}`)) {
          const card = allCards.get(`${rightX},${position.y}`);
          if (card) {
            positions.push({ x: rightX, y: position.y });
            cards.push(card);
          }
          rightX++;
        }
      } else {
        let upY = position.y - 1;
        while (allCards.has(`${position.x},${upY}`)) {
          const card = allCards.get(`${position.x},${upY}`);
          if (card) {
            positions.unshift({ x: position.x, y: upY });
            cards.unshift(card);
          }
          upY--;
        }

        let downY = position.y + 1;
        while (allCards.has(`${position.x},${downY}`)) {
          const card = allCards.get(`${position.x},${downY}`);
          if (card) {
            positions.push({ x: position.x, y: downY });
            cards.push(card);
          }
          downY++;
        }
      }

      return { cards, positions };
    },
    []
  );

  const getValidWildcardValues = useCallback(
    (wildCard: Card, position: Coordinate): WildValue[] => {
      if (!gameState || !wildCard.isWild || wildCard.wildValue) {
        return [];
      }

      const tempGrid = new Grid();
      for (const [key, card] of gameState.grid.positions.entries()) {
        const [x, y] = key.split(',').map(Number);
        tempGrid.addCard(x, y, card);
      }

      for (const placement of pendingPlacements) {
        if (placement.position.x !== position.x || placement.position.y !== position.y) {
          const card = placement.card;
          if (card.wildValue) {
            const cardWithValue = new Card(
              card.shape,
              card.number,
              card.color,
              true,
              card.wildValue
            );
            tempGrid.addCard(placement.position.x, placement.position.y, cardWithValue);
          } else {
            tempGrid.addCard(placement.position.x, placement.position.y, card);
          }
        }
      }

      const hLine = getCompleteLineForWildcard(position, 'horizontal', tempGrid, wildCard);
      const vLine = getCompleteLineForWildcard(position, 'vertical', tempGrid, wildCard);

      const validValues: WildValue[] = [];
      const shapes: ('Square' | 'Circle' | 'Triangle' | 'Plus')[] = [
        'Square',
        'Circle',
        'Triangle',
        'Plus',
      ];
      const numbers: Array<1 | 2 | 3 | 4> = [1, 2, 3, 4];
      const colors: ('Red' | 'Blue' | 'Green' | 'Yellow')[] = ['Red', 'Blue', 'Green', 'Yellow'];

      for (const shape of shapes) {
        for (const number of numbers) {
          for (const color of colors) {
            const testValue: WildValue = { shape, number, color };
            const testCard = new Card(shape, number, color, true, testValue);

            let isValid = true;

            if (hLine && hLine.cards.length >= 2) {
              const testHLine = hLine.cards
                .filter((c) => c !== undefined && c !== null)
                .map((c) => (c && c.isWild && !c.wildValue ? testCard : c)) as Card[];
              const hResult = Validation.validateLineRules(testHLine);
              if (!hResult.isValid) isValid = false;
            }

            if (isValid && vLine && vLine.cards.length >= 2) {
              const testVLine = vLine.cards
                .filter((c) => c !== undefined && c !== null)
                .map((c) => (c && c.isWild && !c.wildValue ? testCard : c)) as Card[];
              const vResult = Validation.validateLineRules(testVLine);
              if (!vResult.isValid) isValid = false;
            }

            if (isValid) validValues.push(testValue);
          }
        }
      }

      return validValues;
    },
    [gameState, pendingPlacements, getCompleteLineForWildcard]
  );

  const exportGame = useCallback(() => {
    if (!gameState || !gameId) return null;
    const serialized = serializeGameState(gameState, gameId);
    return JSON.stringify(serialized, null, 2);
  }, [gameState, gameId]);

  const importGame = useCallback((json: string) => {
    try {
      const serialized = JSON.parse(json) as SerializableGameState;
      const loadedState = deserializeGameState(serialized);
      const confirmedToLoadImportedGame = confirm(
        'Are you sure you want to load this game? This will overwrite your current game.'
      );
      if (!confirmedToLoadImportedGame) return { success: false, error: 'Game load cancelled' };
      setGameState(loadedState);
      setGameId(serialized.id);

      // Update URL
      const url = new URL(window.location.href);
      url.searchParams.set('game', serialized.id);
      window.history.pushState({}, '', url);

      return { success: true };
    } catch (e) {
      return { success: false, error: 'Invalid game JSON' };
    }
  }, []);

  return {
    gameState,
    startGame,
    placeCards,
    passTurn,
    discardCards,
    recycleWildCard,
    resetGame,

    selectedCards,
    pendingPlacements,
    nextCardIndex,
    selectCard,
    setSelectedCards,
    setPendingPlacements,
    placePreview,
    confirmTurn,
    cancelPreview,
    discardSelected,
    passTurnAndClear,
    resetSelection,
    getValidWildcardValues,
    setWildcardValueAtIndex,

    exportGame,
    importGame,
  };
}
