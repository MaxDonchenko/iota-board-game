import { useState, useRef } from 'react';
import { SettingsDialog } from '@/components/Settings/SettingsDialog';
import { ActionsDialog } from '@/components/Actions/ActionsDialog';
import { GameOverview } from '@/components/GameOverview/GameOverview';
import { GameOver } from '@/components/GameOver/GameOver';
import { GameBoard } from '@/components/GameBoard/GameBoard';
import { PlayerHand } from '@/components/PlayerHand/PlayerHand';
import { ScoreDisplay } from '@/components/ScoreDisplay/ScoreDisplay';
import type { GameState } from '@/types/Game.types';
import type { Card as CardType } from '@/game/Card';
import type { WildValue } from '@/types/Card.types';
import type { Coordinate } from '@/types/Grid.types';
import styles from '@/App.module.css';

interface GameRendererProps {
  gameState: GameState;
  selectedCards: CardType[];
  pendingPlacements: Array<{
    card: CardType;
    position: { x: number; y: number };
    wildValue?: WildValue;
  }>;
  nextCardIndex: number;
  isMyTurn: boolean;
  isAITurn: boolean;
  onSelectCard: (card: CardType, index: number) => void;
  onPlaceCard: (position: Coordinate) => void;
  onConfirmTurn: () => void;
  onCancelPreview: () => void;
  onDiscard: () => void;
  onPass: () => void;
  onNewGame: () => void;
  onExport: () => void;
  onImport: () => void;
}

/**
 * Renders the complete game UI
 * Separated from App.tsx to be reusable in stories
 */
export function GameRenderer({
  gameState,
  selectedCards,
  pendingPlacements,
  nextCardIndex,
  isMyTurn,
  isAITurn,
  onSelectCard,
  onPlaceCard,
  onConfirmTurn,
  onCancelPreview,
  onDiscard,
  onPass,
  onNewGame,
  onExport,
  onImport,
}: GameRendererProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const actionsButtonRef = useRef<HTMLButtonElement>(null);

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isGameOver = gameState.phase === 'ended' || gameState.phase === 'draw';

  return (
    <div className={styles.container}>
      <ActionsDialog
        isOpen={showActions}
        onClose={() => setShowActions(false)}
        onExport={onExport}
        onImport={onImport}
        onNewGame={onNewGame}
        buttonRef={actionsButtonRef}
      />

      <SettingsDialog
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        buttonRef={settingsButtonRef}
      />

      {/* Top-right controls */}
      <div
        style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          zIndex: 1000,
          display: 'flex',
          gap: '0.5rem',
        }}
      >
        <button
          ref={actionsButtonRef}
          onClick={() => setShowActions(!showActions)}
          className={styles.actionsButton}
          title="Additional Actions"
        >
          ⋮
        </button>
        <button
          ref={settingsButtonRef}
          onClick={() => setShowSettings(!showSettings)}
          className="settings-button"
          style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
        >
          Settings
        </button>
      </div>

      {/* Left Sidebar */}
      <div className={styles.sidebar}>
        {isGameOver ? (
          <GameOver gameState={gameState} onNewGame={onNewGame} />
        ) : (
          <>
            <div
              style={{
                padding: '1rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '8px',
              }}
            >
              <GameOverview gameState={gameState} gameStartTime={gameState?.startTime} />
            </div>

            <div
              style={{
                padding: '1rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '8px',
              }}
            >
              <ScoreDisplay gameState={gameState} />
            </div>

            {currentPlayer && (
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '8px',
                  opacity: isMyTurn && !isAITurn ? 1 : 0.6,
                  pointerEvents: isMyTurn && !isAITurn ? 'auto' : 'none',
                }}
              >
                <h3
                  style={{
                    color: 'var(--text-primary)',
                    marginBottom: '1rem',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                  }}
                >
                  {!isMyTurn ? `${currentPlayer.name}'s hand` : 'Your hand'}
                </h3>
                <PlayerHand
                  cards={currentPlayer.hand}
                  selectedCards={selectedCards}
                  onSelectionChange={(cards) => {
                    // Reset and re-select the provided cards
                    currentPlayer.hand.forEach((card, index) => {
                      if (cards.includes(card) && !selectedCards.includes(card)) {
                        onSelectCard(card, index);
                      }
                    });
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Main Game Area */}
      <div className={styles.mainArea}>
        <GameBoard
          grid={gameState.grid}
          selectedCards={selectedCards}
          pendingPlacements={pendingPlacements}
          nextCardIndex={nextCardIndex}
          onPlaceCard={onPlaceCard}
        />

        {pendingPlacements.length > 0 && !isGameOver && isMyTurn && !isAITurn && (
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
            }}
          >
            <button onClick={onConfirmTurn} className="confirm-button">
              Confirm Turn
            </button>
            <button onClick={onCancelPreview} className="cancel-button">
              Cancel
            </button>
          </div>
        )}

        {pendingPlacements.length === 0 && !isGameOver && (
          <>
            <div
              style={{
                padding: '1rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '8px',
              }}
            >
              <h3
                style={{
                  color: 'var(--text-primary)',
                  marginBottom: '1rem',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                }}
              >
                Option A: Place Cards
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Click cards in your hand, then click the board to place them.
              </p>
              <button
                onClick={() => {}}
                className="place-button"
                disabled={selectedCards.length === 0 || !isMyTurn || isAITurn}
              >
                Place {selectedCards.length} Card(s)
              </button>
            </div>

            <div
              style={{
                padding: '1rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '8px',
              }}
            >
              <h3
                style={{
                  color: 'var(--text-primary)',
                  marginBottom: '1rem',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                }}
              >
                Option B: Discard
              </h3>
              <div
                style={{
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                }}
              >
                <p style={{ margin: 0 }}>Trade cards for new ones. Ends turn.</p>
              </div>
              <button
                onClick={onDiscard}
                className="discard-button"
                disabled={!isMyTurn || gameState.deck.isEmpty()}
                title={gameState.deck.isEmpty() ? 'Deck is empty - cannot discard' : ''}
              >
                Discard Selected ({selectedCards.length})
              </button>
            </div>

            <div
              style={{
                padding: '1rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '8px',
              }}
            >
              <h3
                style={{
                  color: 'var(--text-primary)',
                  marginBottom: '1rem',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                }}
              >
                Option C: Pass
              </h3>
              <div
                style={{
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                }}
              >
                <p style={{ margin: 0 }}>Skip your turn. Ends turn.</p>
              </div>
              <button onClick={onPass} className="pass-button" disabled={!isMyTurn || isAITurn}>
                Pass Turn
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
