import React, { useRef, useEffect } from 'react';
import styles from './ActionsDialog.module.css';

interface ActionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  onImport: () => void;
  buttonRef: React.RefObject<HTMLButtonElement>;
}

export function ActionsDialog({
  isOpen,
  onClose,
  onExport,
  onImport,
  buttonRef,
}: ActionsDialogProps) {
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
        right: `${window.innerWidth - rect.right}px`,
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
      </div>
    </div>
  );
}
