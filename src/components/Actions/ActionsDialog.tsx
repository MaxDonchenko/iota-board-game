import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ActionsDialog.module.css';

interface ActionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  onImport: () => void;
  onNewGame: () => void;
  buttonRef: React.RefObject<HTMLButtonElement>;
}

export function ActionsDialog({
  isOpen,
  onClose,
  onExport,
  onImport,
  onNewGame,
  buttonRef,
}: ActionsDialogProps) {
  const navigate = useNavigate();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dialogRef.current &&
        !dialogRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, buttonRef]);

  if (!isOpen) return null;

  const rect = buttonRef.current?.getBoundingClientRect();
  const style: React.CSSProperties = rect
    ? {
        position: 'fixed',
        top: `${rect.bottom + 8}px`,
        right: `${window.innerWidth - rect.left}px`, // Position to the left of the button
      }
    : {};

  return (
    <div ref={dialogRef} className={styles.dialog} style={style}>
      <h3 className={styles.title}>Additional Actions</h3>
      <div className={styles.options}>
        <button
          className={styles.option}
          onClick={() => {
            onExport();
            onClose();
          }}
        >
          <span className={styles.icon}>📤</span>
          <div className={styles.text}>
            <div className={styles.label}>Export Game</div>
            <div className={styles.description}>Copy game state JSON to clipboard</div>
          </div>
        </button>
        <button
          className={styles.option}
          onClick={() => {
            onImport();
            onClose();
          }}
        >
          <span className={styles.icon}>📥</span>
          <div className={styles.text}>
            <div className={styles.label}>Import Game</div>
            <div className={styles.description}>Load game from JSON string</div>
          </div>
        </button>
        <button
          className={styles.option}
          onClick={() => {
            onNewGame();
            onClose();
          }}
        >
          <span className={styles.icon}>🔄</span>
          <div className={styles.text}>
            <div className={styles.label}>New Game</div>
            <div className={styles.description}>Start a fresh match</div>
          </div>
        </button>
        <button
          className={styles.option}
          onClick={() => {
            const currentUrl = window.location.href;
            const baseUrl = currentUrl.split('#')[0];
            window.open(`${baseUrl}#/info`, '_blank', 'noopener,noreferrer');
            onClose();
          }}
        >
          <span className={styles.icon}>ℹ️</span>
          <div className={styles.text}>
            <div className={styles.label}>Info</div>
            <div className={styles.description}>Game information and help</div>
          </div>
        </button>
      </div>
    </div>
  );
}
