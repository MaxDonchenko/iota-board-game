import { useEffect, useState } from 'react';
import styles from './Notification.module.css';

interface NotificationProps {
  message: string;
  duration?: number;
  onClose?: () => void;
}

export function Notification({ message, duration = 3000, onClose }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onClose?.();
      }, 300); // Wait for fade-out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`${styles.notification} ${isVisible ? styles.visible : ''}`}>{message}</div>
  );
}
