import { useState, useCallback, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { GameStateManager } from '@/game/GameState';
import { Validation } from '@/game/Validation';
import { Scoring } from '@/game/Scoring';
import { WildCardManager } from '@/game/WildCard';
import { Card } from '@/game/Card';
import { Grid } from '@/game/Grid';
import {
  serializeGameState,
  deserializeGameState,
  generateGameId,
  saveGameToStorage,
  loadGameFromStorage, // Keep loadGameFromStorage as it's used in this file
  type SerializableGameState,
} from '@/utils/gamePersistence';
import { AIEngine } from '@/ai/AIEngine';
import type { GameState, GameSettings, GameMode, PlayerConfig } from '@/types/Game.types';
import type { Placement } from '@/game/Validation';
import type { WildCardReplacement } from '@/game/WildCard';
import type { Coordinate } from '@/types/Grid.types';
import type { WildValue } from '@/types/Card.types';
import { RoutingService } from '@/services/routing/RoutingService';

export const PLAYER_COLORS = ['#FF4B2B', '#2B95FF', '#61BB46', '#F9A51B'];

interface PreviewPlacement {
  card: Card;
  originalHandCard: Card;
  position: Coordinate;
  wildValue?: WildValue;
}

export interface UseGameReturn {
  gameState: GameState | null;
  currentPlayer: import('@/types/Game.types').Player | null;
  isAITurn: boolean;
  startGame: (playerConfigs: PlayerConfig[], gameMode: GameMode, settings: GameSettings) => void;
  placeCards: (
    placements: Placement[],
    cardMapping?: Map<Card, Card>
  ) => { success: boolean; error?: string };
  passTurn: (cardsToTrade?: string[]) => void;
  discardCards: (cards: Card[]) => { success: boolean; error?: string };
  recycleWildCard: (replacement: WildCardReplacement) => { success: boolean; error?: string };
  resetGame: () => void;
  isGameActive: boolean;

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
  removePreviewPlacement: (position: Coordinate) => void;

  // Persistence helpers
  exportGame: () => string | null;
  importGame: (json: string) => { success: boolean; error?: string };
}

// This is the actual logic that runs the game.
// Most components should use useGame() which will correctly
// proxy to the context if we are inside a provider (like in Storybook).
export function useGameImplementation(): UseGameReturn {
  const [gameId, setGameId] = useState<string | null>(() => {
    return RoutingService.getGameIdFromUrl();
  });

  const [gameState, setGameState] = useState<GameState | null>(() => {
    const gameIdFromUrl = RoutingService.getGameIdFromUrl();
    if (gameIdFromUrl) {
      return loadGameFromStorage(gameIdFromUrl);
    }
    return null;
  });

  // UI selection state
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [pendingPlacements, setPendingPlacements] = useState<PreviewPlacement[]>([]);

  const currentPlayer = useMemo(
    () => (gameState ? gameState.players[gameState.currentPlayerIndex] : null),
    [gameState]
  );

  const isGameActive = !!gameState;

  const isAITurn = useMemo(() => currentPlayer?.isAI || false, [currentPlayer]);

  const nextCardIndex = useMemo(() => {
    const placedCards = new Set(pendingPlacements.map((p) => p.originalHandCard));
    const index = selectedCards.findIndex((c) => !placedCards.has(c));
    return index === -1 ? selectedCards.length : index;
  }, [selectedCards, pendingPlacements]);

  const { pathname } = useLocation();

  // Load game from URL
  useEffect(() => {
    const gameIdFromUrl = RoutingService.getGameIdFromUrl();

    if (gameIdFromUrl && gameIdFromUrl !== gameId) {
      console.log('[Game] Game ID changed in URL:', gameIdFromUrl, 'Current:', gameId);
      const loadedState = loadGameFromStorage(gameIdFromUrl);
      if (loadedState) {
        console.log('[Game] Successfully loaded state from storage for:', gameIdFromUrl);
        setGameState(loadedState);
        setGameId(gameIdFromUrl);
      } else {
        console.warn('[Game] Failed to load state from storage for:', gameIdFromUrl);
        // We don't clear the URL immediately to avoid race conditions during navigation
      }
    }
  }, [gameId, pathname]);

  // Also listen to popstate for back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const gameIdFromUrl = RoutingService.getGameIdFromUrl();
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
  }, [gameId, pathname]);

  // Sync gameId to URL query params
  useEffect(() => {
    const idInUrl = RoutingService.getGameIdFromUrl();

    // Only sync game ID for game paths
    if (pathname.includes('/game')) {
      if (gameId && idInUrl !== gameId) {
        RoutingService.setGameIdInUrl(gameId);
      }
    } else {
      // Don't remove game ID from URL if we're on multiplayer setup page
      // (it's used for the lobby connection)
      if (idInUrl && !pathname.includes('/multiplayer/setup')) {
        RoutingService.removeGameIdFromUrl();
      }
    }
  }, [gameId, pathname]);

  // Save game to storage whenever it changes
  useEffect(() => {
    if (gameState && gameId) {
      saveGameToStorage(gameState, gameId);
    }
  }, [gameState, gameId]);

  const startGame = useCallback(
    (playerConfigs: PlayerConfig[], gameMode: GameMode, settings: GameSettings) => {
      console.log('[Game] startGame called', {
        playersCount: playerConfigs.length,
        gameMode,
        playerNames: playerConfigs.map((p) => p.name),
      });
      const newGameId = generateGameId();
      console.log('[Game] Generated game ID:', newGameId);
      const configs = playerConfigs.map((c, i) => ({
        ...c,
        color: PLAYER_COLORS[i % PLAYER_COLORS.length],
      }));
      console.log('[Game] Creating initial game state...');
      const newState = GameStateManager.createInitialState(configs, gameMode, settings);
      console.log('[Game] Game state created', {
        phase: newState.phase,
        playersCount: newState.players.length,
        currentPlayerIndex: newState.currentPlayerIndex,
      });
      console.log('[Game] Setting gameState and gameId...');
      setGameState(newState);
      setGameId(newGameId);
      console.log('[Game] State setters called');

      // Save to storage immediately
      console.log('[Game] Saving to storage...');
      saveGameToStorage(newState, newGameId);
      console.log('[Game] startGame complete');
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

      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      const isFinishingHand = placements.length === currentPlayer.hand.length;
      const isFinalTurnForPlayer = isFinishingHand && gameState.deck.isEmpty();

      const scoreResult = Scoring.calculateTurnScore(
        affectedLines,
        placements.length,
        isFinalTurnForPlayer || gameState.isFinalTurn
      );

      // Update player score
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
      const nextPhase = isGameEnd ? 'ended' : finalState.phase;
      const nextTurnState = isGameEnd ? finalState : GameStateManager.nextTurn(finalState);

      setGameState({
        ...nextTurnState,
        phase: nextPhase,
        lastMovePlacements: placements,
        lastMovePlayerIndex: gameState.currentPlayerIndex,
      });

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

      // Move to next turn. Ensure we mark this turn as a pass so
      // `nextTurn` correctly increments pass counters.
      const stateToAdvance: GameState = {
        ...gameState,
        turnPhase: 'pass',
      };

      const nextState = GameStateManager.nextTurn(stateToAdvance);
      setGameState({
        ...nextState,
        lastMovePlacements: [],
        lastMovePlayerIndex: gameState.currentPlayerIndex,
      });
    },
    [gameState]
  );

  // Handle AI Turns
  useEffect(() => {
    if (gameState && gameState.phase === 'playing') {
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      if (currentPlayer.isAI) {
        const move = AIEngine.findMove(gameState, currentPlayer.difficulty || 'medium');
        if (move) {
          const timer = setTimeout(() => {
            placeCards(move.placements);
          }, 1500);
          return () => clearTimeout(timer);
        } else {
          // AI passes if no moves found
          const timer = setTimeout(() => {
            passTurn();
          }, 1500);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [gameState, passTurn, placeCards]);

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
    RoutingService.removeGameIdFromUrl();

    // Clear from storage
    if (gameId) {
      localStorage.removeItem(`iota-game-${gameId}`);
    }
  }, [gameId]);

  // ----- UI selection helpers -----
  // Sync pending placements with selected cards
  // This handles the case where a user unselects a card that was already placed on the board as a preview
  useEffect(() => {
    const validPending = pendingPlacements.filter((p) =>
      selectedCards.includes(p.originalHandCard)
    );
    if (validPending.length !== pendingPlacements.length) {
      setPendingPlacements(validPending);
    }
  }, [selectedCards, pendingPlacements]);

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

      const placedCards = new Set(pendingPlacements.map((p) => p.originalHandCard));
      const nextCard = selectedCards.find((c) => !placedCards.has(c));
      if (!nextCard) return;

      const newPlacements = [
        ...pendingPlacements,
        { card: nextCard, originalHandCard: nextCard, position },
      ];
      setPendingPlacements(newPlacements);
    },
    [gameState, selectedCards, pendingPlacements]
  );

  const confirmTurn = useCallback(() => {
    if (!gameState || pendingPlacements.length === 0) return;
    // Ensure all wildcards have an assigned preview value before confirming
    const missingWildValue = pendingPlacements.some((p) => p.card.isWild && !p.wildValue);
    if (missingWildValue) {
      alert('Please choose values for all wildcards before confirming your turn');
      return;
    }
    const cardMapping = new Map<Card, Card>();
    const placements = pendingPlacements.map((p: PreviewPlacement) => {
      let card = p.card;
      const originalCard = p.originalHandCard;
      if (card.isWild && p.wildValue) {
        // Use the card that was already updated with the wild value in the preview phase
        card = p.card;
        cardMapping.set(card, originalCard);
      }
      return { card, position: p.position };
    });

    const result = placeCards(placements, cardMapping);
    if (result.success) {
      setSelectedCards([]);
      setPendingPlacements([]);
    } else {
      alert(result.error || 'Invalid placement');
      setPendingPlacements([]);
    }
  }, [gameState, pendingPlacements, placeCards]);

  const cancelPreview = useCallback(() => {
    setPendingPlacements([]);
  }, []);

  const passTurnAndClear = useCallback(() => {
    passTurn();
    setSelectedCards([]);
    setPendingPlacements([]);
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
    } else {
      alert(result.error || 'Failed to discard cards');
    }
  }, [selectedCards, discardCards]);

  const resetSelection = useCallback(() => {
    setSelectedCards([]);
    setPendingPlacements([]);
  }, []);

  const removePreviewPlacement = useCallback((position: Coordinate) => {
    setPendingPlacements((prev) =>
      prev.filter((p) => p.position.x !== position.x || p.position.y !== position.y)
    );
  }, []);

  const setWildcardValueAtIndex = useCallback((index: number, value: WildValue) => {
    setPendingPlacements((current) =>
      current.map((p, i) => {
        if (i === index) {
          // Create a new card object with the given value so it gets correctly picked up by Validation
          const updatedCard = new Card(value.shape, value.number, value.color, true, value);
          return { ...p, card: updatedCard, wildValue: value };
        }
        return p;
      })
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
          if (placement.wildValue) {
            const cardWithValue = new Card(
              placement.wildValue.shape,
              placement.wildValue.number,
              placement.wildValue.color,
              true,
              placement.wildValue
            );
            tempGrid.addCard(placement.position.x, placement.position.y, cardWithValue);
          } else {
            tempGrid.addCard(placement.position.x, placement.position.y, placement.card);
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
    if (!gameState) {
      console.log('[Game] exportGame: gameState is null');
      return null;
    }
    if (!gameId) {
      console.log('[Game] exportGame: gameId is null', { gameStateExists: !!gameState });
      return null;
    }
    console.log('[Game] exportGame: Both gameState and gameId exist', {
      gameId,
      gameStatePhase: gameState.phase,
      playersCount: gameState.players.length,
    });
    const serialized = serializeGameState(gameState, gameId);
    const json = JSON.stringify(serialized);
    console.log('[Game] exportGame: Serialization complete', { jsonLength: json.length });
    return json;
  }, [gameState, gameId]);

  const importGame = useCallback(
    (json: string) => {
      try {
        const serialized = JSON.parse(json) as SerializableGameState;
        const loadedState = deserializeGameState(serialized);
        const confirmedToLoadImportedGame =
          isGameActive && gameState?.phase !== 'ended'
            ? confirm(
                'Are you sure you want to load this game? This will overwrite your current game.'
              )
            : true;
        if (!confirmedToLoadImportedGame) return { success: false, error: 'Game load cancelled' };
        setGameState(loadedState);
        setGameId(serialized.id);

        // Update URL
        RoutingService.setGameIdInUrl(serialized.id);

        return { success: true };
      } catch (e) {
        return { success: false, error: 'Invalid game JSON' };
      }
    },
    [isGameActive, gameState?.phase]
  );

  return {
    gameState,
    currentPlayer,
    isAITurn,
    startGame,
    placeCards,
    passTurn,
    discardCards,
    recycleWildCard,
    resetGame,
    isGameActive,

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
    removePreviewPlacement,

    exportGame,
    importGame,
  };
}

import { useContext } from 'react';
import { GameContext } from '@/context/GameContext';

/**
 * Proxy hook that allows mocking game logic in Storybook/Tests
 * via GameContext.Provider, but falls back to real logic otherwise.
 */
export function useGame(): UseGameReturn {
  const context = useContext(GameContext);
  const implementation = useGameImplementation();

  return context || implementation;
}
