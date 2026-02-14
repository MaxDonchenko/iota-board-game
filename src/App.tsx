import { useState, useRef, useEffect, useMemo } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { MultiplayerProvider, useMultiplayer } from './context/MultiplayerContext';
import { useMultiplayerGame } from './hooks/useMultiplayerGame';
import { Welcome } from './components/Welcome/Welcome';
import { HotseatSetup } from './components/GameSetup/HotseatSetup';
import { MultiplayerSetup } from './components/MultiplayerSetup/MultiplayerSetup';
import { BoardEditor } from './components/BoardEditor/BoardEditor';
import { Info } from './components/Info/Info';
import { GameRenderer } from './components/GameRenderer/GameRenderer';
import { SettingsDialog } from './components/Settings/SettingsDialog';
import { GameProvider, useGameContext, type PlayerConfig } from './context/GameContext';
import type { GameMode } from './types/Game.types';
import type { Card as CardType } from './game/Card';
import { RoutingService } from './services/routing/RoutingService';

import './styles/index.css';
import './styles/themes.css';
import './styles/card-animations.css';

function SettingsHeader() {
  const [showSettings, setShowSettings] = useState(false);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 1000 }}>
        <button
          ref={settingsButtonRef}
          onClick={() => setShowSettings(!showSettings)}
          className="settings-button"
        >
          Settings
        </button>
      </div>
      <SettingsDialog
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        buttonRef={settingsButtonRef}
      />
    </>
  );
}

function GameSession() {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const { service, myPlayerName, isHost } = useMultiplayer();
  const {
    gameState,
    currentPlayer,
    isAITurn,
    resetGame,
    selectedCards,
    pendingPlacements,
    nextCardIndex,
    setSelectedCards,
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
    isGameActive,
  } = useGameContext();
  const { sendGameStateToPeers, sendGameStateToHost } = useMultiplayerGame();

  // Send game state to peers after each turn (for host)
  // Send game state to host after each turn (for peers)
  // Also sync when game ends (phase === 'ended')
  // Must be called before any conditional returns
  const isMultiplayer = service !== null;
  useEffect(() => {
    if (
      isMultiplayer &&
      gameState &&
      (gameState.phase === 'playing' || gameState.phase === 'ended')
    ) {
      // Small delay to ensure state is fully updated
      const timer = setTimeout(() => {
        if (isHost) {
          // Host sends to all peers
          sendGameStateToPeers();
        } else {
          // Peer sends to host
          sendGameStateToHost();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [
    gameState?.currentPlayerIndex,
    gameState?.phase,
    isMultiplayer,
    isHost,
    sendGameStateToPeers,
    sendGameStateToHost,
    gameState,
  ]);

  const handleNewGame = () => {
    if (isGameActive && gameState?.phase !== 'ended') {
      if (
        !window.confirm(
          'Are you sure you want to start a new game? This will end the current game.'
        )
      ) {
        return;
      }
    }
    resetGame();
    navigate('/');
  };

  const handleExport = () => {
    const data = exportGame();
    if (data) {
      navigator.clipboard.writeText(data).then(() => {
        alert('Game state copied to clipboard!');
      });
    }
  };

  const handleImport = () => {
    const json = prompt('Paste game state JSON:');
    if (json) {
      const result = importGame(json);
      if (!result.success) {
        alert(result.error);
      }
    }
  };

  // Wait a bit to ensure game over state is synced before disconnecting
  // For multiplayer peers, wait a bit for game state to be imported
  const isMultiplayerPeer = service !== null && !isHost;

  // Clear multiplayer connection when game ends (must be before conditional returns)
  useEffect(() => {
    if (gameState?.phase === 'ended' && service) {
      // Wait 2 seconds to ensure game over state is synced to all players
      const timer = setTimeout(() => {
        console.log('[Multiplayer] Game ended, disconnecting after sync delay...');
        service.disconnect();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameState?.phase, service]);

  // Determine which player is "Me" at the local machine
  const localPlayer = useMemo(() => {
    if (!gameState) return null;
    if (isMultiplayer && myPlayerName) {
      return gameState.players.find((p) => p.name === myPlayerName) || null;
    }
    // In Hotseat mode, "Me" is the current human player.
    // If it's an AI's turn, we show the first available human player.
    if (!isAITurn) return currentPlayer;
    return gameState.players.find((p) => !p.isAI) || null;
  }, [gameState, isMultiplayer, myPlayerName, isAITurn, currentPlayer]);

  // It's "My Turn" if the current active player matches my identity
  const isMyTurn = useMemo(() => {
    if (!isGameActive || !currentPlayer) return false;
    if (isMultiplayer) {
      return !myPlayerName || currentPlayer.name === myPlayerName;
    }
    return !isAITurn;
  }, [isGameActive, isMultiplayer, myPlayerName, currentPlayer, isAITurn]);

  if (!isGameActive || !gameState) {
    const hasGameId = !!RoutingService.getGameIdFromUrl();

    // If we have a game ID in URL, stay on the loading screen
    // It will either load, or remain here until the user chooses to go back
    if (isMultiplayerPeer || hasGameId) {
      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div>Loading game...</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {isMultiplayerPeer ? 'Waiting for game state from host...' : 'Restoring session...'}
          </div>
          <button
            onClick={() => navigate('/')}
            className="secondary-button"
            style={{ marginTop: '1rem' }}
          >
            Cancel and Return Home
          </button>
        </div>
      );
    }
    // Only redirect to home if there is NO game ID and NO game state
    return <Navigate to="/" />;
  }

  // Handle card selection (adapt for GameRenderer's onSelectCard interface)
  const handleSelectCard = (card: CardType, _index: number) => {
    if (isMyTurn && !isAITurn) {
      const newSelection = selectedCards.includes(card)
        ? selectedCards.filter((c) => c !== card)
        : [...selectedCards, card];
      setSelectedCards(newSelection);
    }
  };

  return (
    <GameRenderer
      gameState={gameState}
      selectedCards={selectedCards}
      pendingPlacements={pendingPlacements}
      nextCardIndex={nextCardIndex}
      isMyTurn={isMyTurn}
      isAITurn={isAITurn}
      onSelectCard={handleSelectCard}
      onPlaceCard={placePreview}
      onConfirmTurn={confirmTurn}
      onCancelPreview={cancelPreview}
      onDiscard={discardSelected}
      onPass={passTurnAndClear}
      onNewGame={handleNewGame}
      onExport={handleExport}
      onImport={handleImport}
      onResetSelection={resetSelection}
      onWildcardValue={setWildcardValueAtIndex}
      onRemoveCard={removePreviewPlacement}
      getValidWildcardValues={getValidWildcardValues}
      localPlayer={localPlayer}
      settings={settings}
    />
  );
}

function HotseatSetupPage() {
  const navigate = useNavigate();
  const { startGame, resetSelection } = useGameContext();
  const { settings } = useSettings();

  const handleStartGame = (playerConfigs: PlayerConfig[], gameMode: GameMode) => {
    startGame(playerConfigs, gameMode, settings);
    resetSelection();
    navigate('/hotseat/game');
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <SettingsHeader />
      <HotseatSetup onStartGame={handleStartGame} onBack={() => navigate('/')} />
    </div>
  );
}

function App() {
  return (
    <SettingsProvider>
      <ThemeProvider>
        <GameProvider>
          <MultiplayerProvider>
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/hotseat/setup" element={<HotseatSetupPage />} />
              <Route path="/hotseat/game" element={<GameSession />} />
              <Route
                path="/ai"
                element={
                  <div>
                    <SettingsHeader />
                    AI Mode (Coming Soon)
                  </div>
                }
              />
              <Route path="/multiplayer/setup/:gameId?" element={<MultiplayerSetup />} />
              <Route path="/multiplayer/game" element={<GameSession />} />
              <Route path="/editor" element={<BoardEditor />} />
              <Route path="/info" element={<Info />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </MultiplayerProvider>
        </GameProvider>
      </ThemeProvider>
    </SettingsProvider>
  );
}

export default App;
