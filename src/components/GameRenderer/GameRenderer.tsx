import { useState, useRef } from 'react';
import { SettingsDialog } from '@/components/Settings/SettingsDialog';
import { ActionsDialog } from '@/components/Actions/ActionsDialog';
import { GameOverview } from '@/components/GameOverview/GameOverview';
import { GameOver } from '@/components/GameOver/GameOver';
import { GameBoard } from '@/components/GameBoard/GameBoard';
import { PlayerHand } from '@/components/PlayerHand/PlayerHand';
import { ScoreDisplay } from '@/components/ScoreDisplay/ScoreDisplay';
import { Card as CardComponent } from '@/components/Card/Card';
import { Card } from '@/game/Card';
import { useBoardScale } from '@/hooks/useBoardScale';
import { GameControls } from '@/components/GameControls/GameControls';
import type { GameState } from '@/types/Game.types';
import type { Card as CardType } from '@/game/Card';
import type { WildValue } from '@/types/Card.types';
import type { Coordinate } from '@/types/Grid.types';
import type { GameSettings } from '@/types/Game.types';
import styles from '@/App.module.css';

interface GameRendererProps {
  gameState: GameState;
  selectedCards: CardType[];
  pendingPlacements: Array<{
    card: CardType;
    originalHandCard: CardType;
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
  onResetSelection?: () => void;
  onWildcardValue?: (index: number, value: WildValue) => void;
  getValidWildcardValues?: (card: CardType, position: { x: number; y: number }) => WildValue[];
  onRemoveCard?: (position: Coordinate) => void;
  localPlayer?: import('@/types/Game.types').Player | null;
  settings?: GameSettings;
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
  onResetSelection,
  onWildcardValue,
  getValidWildcardValues,
  onRemoveCard,
  localPlayer,
  settings,
}: GameRendererProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const { scale, canZoomIn, canZoomOut, zoomIn, zoomOut } = useBoardScale();
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const actionsButtonRef = useRef<HTMLButtonElement>(null);

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isGameOver = gameState.phase === 'ended' || gameState.phase === 'draw';

  // "Me" is the provided localPlayer, falling back to currentPlayer
  const playerToShowHand = localPlayer || currentPlayer;
  const playerColors = gameState.players.map((p) => p.color);

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

      <GameControls
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        canZoomIn={canZoomIn}
        canZoomOut={canZoomOut}
        onToggleActions={() => setShowActions(!showActions)}
        onToggleSettings={() => setShowSettings(!showSettings)}
        actionsButtonRef={actionsButtonRef}
        settingsButtonRef={settingsButtonRef}
      />

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

            {playerToShowHand && (
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
                  Your hand
                </h3>
                {isAITurn ? (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Waiting for {currentPlayer.name} to make their move...
                  </p>
                ) : null}
                <PlayerHand
                  cards={playerToShowHand.hand}
                  selectedCards={selectedCards}
                  onSelectionChange={(cards) => {
                    // Map selected cards back to indices for onSelectCard
                    const currentSelection = new Set(selectedCards);
                    cards.forEach((card) => {
                      if (!currentSelection.has(card)) {
                        // Find the index of this card
                        const index = playerToShowHand.hand.indexOf(card);
                        if (index !== -1) {
                          onSelectCard(card, index);
                        }
                      }
                    });
                    // Remove deselected cards
                    currentSelection.forEach((card) => {
                      if (!cards.includes(card)) {
                        const index = playerToShowHand.hand.indexOf(card);
                        if (index !== -1) {
                          onSelectCard(card, index);
                        }
                      }
                    });
                  }}
                  onResetSelection={onResetSelection}
                  disabled={!isMyTurn || isAITurn}
                />
              </div>
            )}

            {selectedCards.length > 0 && !isGameOver && isMyTurn && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div
                  style={{
                    padding: '1rem',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
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
                    <p style={{ margin: 0 }}>
                      {pendingPlacements.length === 0
                        ? 'Place your selected cards on the board.'
                        : 'Place all cards to complete turn.'}
                    </p>
                  </div>
                  {pendingPlacements.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ color: 'var(--text-primary)' }}>
                        {pendingPlacements.length} of {selectedCards.length} placed
                      </span>
                      {pendingPlacements.length === selectedCards.length && (
                        <div
                          style={{
                            display: 'flex',
                            gap: '0.5rem',
                            width: '100%',
                            justifyContent: 'center',
                          }}
                        >
                          <button
                            onClick={onConfirmTurn}
                            className="confirm-button"
                            disabled={!isMyTurn}
                          >
                            Confirm Turn
                          </button>
                          <button
                            onClick={onCancelPreview}
                            className="cancel-button"
                            disabled={!isMyTurn}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {pendingPlacements.length === 0 && (
                  <>
                    <div
                      style={{
                        padding: '1rem',
                        backgroundColor: 'var(--bg-secondary)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
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
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
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
                        <p style={{ margin: 0 }}>Skip your turn without changing cards.</p>
                      </div>
                      <button
                        onClick={onPass}
                        className="cancel-button"
                        style={{ width: '100%', fontWeight: 'bold' }}
                        disabled={!isMyTurn}
                      >
                        Pass Turn
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {(() => {
              if (!getValidWildcardValues || !onWildcardValue) return null;
              const wildcardPlacement = pendingPlacements.find(
                (p) => p.card.isWild && !p.wildValue
              );
              if (!wildcardPlacement) return null;
              const validValues = getValidWildcardValues(
                wildcardPlacement.card,
                wildcardPlacement.position
              );
              if (validValues.length === 0) return null;
              return (
                <div
                  style={{
                    padding: '1rem',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
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
                    Wildcard Value
                  </h3>
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.5rem',
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                    }}
                  >
                    {validValues.map((value: WildValue, idx: number) => {
                      const tempCard = new Card(value.shape, value.number, value.color, false);
                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            const index = pendingPlacements.findIndex(
                              (p) => p === wildcardPlacement
                            );
                            if (index !== -1) onWildcardValue(index, value);
                          }}
                          style={{ cursor: 'pointer', padding: '2px' }}
                        >
                          <CardComponent card={tempCard} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </>
        )}
      </div>

      <div className={styles.content} style={{ overflow: 'auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'safe center',
            justifyContent: 'safe center',
            minWidth: '100%',
            minHeight: '100%',
            paddingTop: '3.25rem',
          }}
        >
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: '0 0',
              transition: 'transform 0.2s ease-out',
              display: 'flex',
              flexShrink: 0,
            }}
          >
            <GameBoard
              grid={gameState.grid}
              selectedCards={selectedCards}
              pendingPlacements={pendingPlacements}
              nextCardIndex={nextCardIndex}
              onPlaceCard={isMyTurn ? onPlaceCard : () => {}}
              onRemoveCard={isMyTurn ? onRemoveCard : undefined}
              settings={settings}
              lastMovePlacements={gameState.lastMovePlacements}
              lastMovePlayerIndex={gameState.lastMovePlayerIndex}
              playerColors={playerColors}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
