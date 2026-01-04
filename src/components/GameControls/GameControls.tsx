import { RefObject } from 'react';
import styles from '@/App.module.css';

interface GameControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  canZoomIn: boolean;
  canZoomOut: boolean;
  onToggleActions: () => void;
  onToggleSettings: () => void;
  actionsButtonRef: RefObject<HTMLButtonElement>;
  settingsButtonRef: RefObject<HTMLButtonElement>;
}

export function GameControls({
  onZoomIn,
  onZoomOut,
  canZoomIn,
  canZoomOut,
  onToggleActions,
  onToggleSettings,
  actionsButtonRef,
  settingsButtonRef,
}: GameControlsProps) {
  return (
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
        onClick={onZoomOut}
        disabled={!canZoomOut}
        className={styles.actionsButton}
        title="Zoom Out"
      >
        -
      </button>
      <button
        onClick={onZoomIn}
        disabled={!canZoomIn}
        className={styles.actionsButton}
        title="Zoom In"
      >
        +
      </button>
      <button
        ref={actionsButtonRef}
        onClick={onToggleActions}
        className={styles.actionsButton}
        title="Additional Actions"
      >
        ⋮
      </button>
      <button
        ref={settingsButtonRef}
        onClick={onToggleSettings}
        className="settings-button"
        style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
      >
        Settings
      </button>
    </div>
  );
}
