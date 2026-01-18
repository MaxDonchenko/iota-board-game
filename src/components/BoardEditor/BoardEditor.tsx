import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameLayout } from '@/components/Layout/GameLayout';
import { GameBoard } from '@/components/GameBoard/GameBoard';
import { CardPicker } from './CardPicker';
import { HandEditor } from './HandEditor';
import { EditorSetup } from './EditorSetup';
import { SimpleList } from '@/components/Info/SimpleList';
import { useBoardEditor } from '@/hooks/useBoardEditor';
import { useBoardScale } from '@/hooks/useBoardScale';
import { GameControls } from '@/components/GameControls/GameControls';
import { ActionsDialog } from '@/components/Actions/ActionsDialog';
import { SettingsDialog } from '@/components/Settings/SettingsDialog';
import { useSettings } from '@/context/SettingsContext';
import type { PlayerConfig, GameMode } from '@/types/Game.types';
import styles from './BoardEditor.module.css';
import appStyles from '@/App.module.css';

export function BoardEditor() {
  const navigate = useNavigate();
  const [setupConfig, setSetupConfig] = useState<{
    players: PlayerConfig[];
    mode: GameMode;
  } | null>(null);

  if (!setupConfig) {
    return (
      <EditorSetup
        onBack={() => navigate('/')}
        onStartEditor={(players, mode) => setSetupConfig({ players, mode })}
      />
    );
  }

  return (
    <BoardEditorWorkspace
      playerConfigs={setupConfig.players}
      gameMode={setupConfig.mode}
      onBackToSetup={() => setSetupConfig(null)}
    />
  );
}

interface WorkspaceProps {
  playerConfigs: PlayerConfig[];
  gameMode: GameMode;
  onBackToSetup: () => void;
}

function BoardEditorWorkspace({ playerConfigs, gameMode, onBackToSetup }: WorkspaceProps) {
  const navigate = useNavigate();
  const { settings } = useSettings();

  const {
    gameState,
    selectedEditorCard,
    allPossibleCards,
    setSelectedEditorCard,
    placeCard,
    removeCard,
    updatePlayerHand,
    exportEditorGame,
    importEditorGame,
    continueGame,
  } = useBoardEditor(playerConfigs, gameMode);

  const { scale, canZoomIn, canZoomOut, zoomIn, zoomOut } = useBoardScale();
  const [showSettings, setShowSettings] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const actionsButtonRef = useRef<HTMLButtonElement>(null);

  const handleExport = () => {
    const data = exportEditorGame();
    navigator.clipboard.writeText(data).then(() => {
      alert('Game state copied to clipboard!');
    });
  };

  const handleImport = () => {
    const json = prompt('Paste game state JSON:');
    if (json) {
      const result = importEditorGame(json);
      if (!result.success) {
        alert(result.error);
      }
    }
  };

  const handleContinue = () => {
    const gameId = continueGame();
    navigate(`/hotseat/game?game=${gameId}`);
  };

  const sidebar = (
    <div className={styles.editorSidebar}>
      <header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <button
            onClick={onBackToSetup}
            className={styles.secondaryButton}
            style={{ padding: '0.2rem 0.6rem' }}
            title="Back to Editor Setup"
          >
            ←
          </button>
          <h2 style={{ margin: 0 }}>Board Editor</h2>
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <section>
          <div className={styles.actionButtons}>
            <button className={styles.primaryButton} onClick={handleContinue}>
              Continue Game From Here
            </button>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className={styles.secondaryButton} style={{ flex: 1 }} onClick={handleExport}>
                Export
              </button>
              <button className={styles.secondaryButton} style={{ flex: 1 }} onClick={handleImport}>
                Import
              </button>
            </div>
          </div>
        </section>

        <CardPicker
          cards={allPossibleCards}
          selectedCard={selectedEditorCard}
          onSelect={setSelectedEditorCard}
        />

        <HandEditor
          players={gameState.players}
          onUpdateHand={updatePlayerHand}
          selectedEditorCard={selectedEditorCard}
        />

        <SimpleList
          title="Tips"
          items={[
            'Pick a card from the list above',
            'Click any empty spot on the board to place it',
            'Right-click (or long press) a card on the board to remove it',
            'Add cards to player hands using "Add Selected"',
          ]}
        />
      </div>
    </div>
  );

  const content = (
    <>
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

      <ActionsDialog
        isOpen={showActions}
        onClose={() => setShowActions(false)}
        onExport={handleExport}
        onImport={handleImport}
        onNewGame={() => navigate('/')}
        buttonRef={actionsButtonRef}
      />

      <SettingsDialog
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        buttonRef={settingsButtonRef}
      />

      <div className={appStyles.boardContainer}>
        <div className={appStyles.boardScaleWrapper} style={{ transform: `scale(${scale})` }}>
          <GameBoard
            grid={gameState.grid}
            selectedCards={[]}
            pendingPlacements={[]}
            nextCardIndex={0}
            onPlaceCard={placeCard}
            onRemoveCard={removeCard}
            settings={settings}
            playerColors={gameState.players.map((p) => p.color)}
          />
        </div>
      </div>
    </>
  );

  return <GameLayout sidebar={sidebar} content={content} />;
}
