import { useRef, useEffect } from 'react';
import { Settings } from './Settings';
import styles from './SettingsDialog.module.css';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  buttonRef: React.RefObject<HTMLButtonElement>;
}

export function SettingsDialog({ isOpen, onClose, buttonRef }: SettingsDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && buttonRef.current && dialogRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const dialog = dialogRef.current;
      
      // Position dialog below the button, aligned to the right
      dialog.style.top = `${buttonRect.bottom + 8}px`;
      dialog.style.right = `${window.innerWidth - buttonRect.right}px`;
    }
  }, [isOpen, buttonRef]);

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
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose, buttonRef]);

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div ref={dialogRef} className={styles.dialog}>
        <Settings />
      </div>
    </>
  );
}

