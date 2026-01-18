import { ReactNode } from 'react';
import styles from '@/App.module.css';

interface GameLayoutProps {
  sidebar: ReactNode;
  content: ReactNode;
}

export function GameLayout({ sidebar, content }: GameLayoutProps) {
  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>{sidebar}</div>
      <div className={styles.content}>{content}</div>
    </div>
  );
}
