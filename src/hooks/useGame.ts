import { useState, useCallback } from 'react';
import { GameStateManager } from '@/game/GameState';
import { Validation } from '@/game/Validation';
import { Scoring } from '@/game/Scoring';
import { WildCardManager } from '@/game/WildCard';
import type { GameState, Player, GameSettings } from '@/types/Game.types';
import type { Placement } from '@/game/Validation';
import type { WildCardReplacement } from '@/game/WildCard';

interface UseGameReturn {
  gameState: GameState | null;
  startGame: (playerNames: string[], gameMode: 'short' | 'full', settings: GameSettings) => void;
  placeCards: (placements: Placement[]) => { success: boolean; error?: string };
  passTurn: (cardsToTrade?: string[]) => void;
  recycleWildCard: (replacement: WildCardReplacement) => { success: boolean; error?: string };
  resetGame: () => void;
}

export function useGame(): UseGameReturn {
  const [gameState, setGameState] = useState<GameState | null>(null);

  const startGame = useCallback((
    playerNames: string[],
    gameMode: 'short' | 'full',
    settings: GameSettings
  ) => {
    const newState = GameStateManager.createInitialState(playerNames, gameMode, settings);
    setGameState(newState);
  }, []);

  const placeCards = useCallback((placements: Placement[]) => {
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
    const affectedLines = gameState.grid.getAllLines().filter(line =>
      line.positions.some(pos =>
        placements.some(p => p.position.x === pos.x && p.position.y === pos.y)
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
    const updatedPlayers = newState.players.map((p, idx) => {
      if (idx === gameState.currentPlayerIndex) {
        return {
          ...p,
          hand: p.hand.filter(card => !placements.some(pl => pl.card === card)),
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
  }, [gameState]);

  const passTurn = useCallback((cardsToTrade: string[] = []) => {
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
      const updatedHand = currentPlayer.hand.filter(card => !cardsToRemove.includes(card));
      
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
  }, [gameState]);

  const recycleWildCard = useCallback((replacement: WildCardReplacement) => {
    if (!gameState) {
      return { success: false, error: 'No game in progress' };
    }

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    
    if (!WildCardManager.canReplaceWild(replacement.wildCard, replacement.replacementCard, gameState.grid)) {
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
            hand: p.hand.filter(c => c !== replacement.replacementCard),
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
  }, [gameState]);

  const resetGame = useCallback(() => {
    setGameState(null);
  }, []);

  return {
    gameState,
    startGame,
    placeCards,
    passTurn,
    recycleWildCard,
    resetGame,
  };
}

