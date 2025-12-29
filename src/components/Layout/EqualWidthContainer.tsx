import { ReactNode } from 'react';
import styles from './EqualWidthContainer.module.css';

interface EqualWidthContainerProps {
  children: ReactNode;
  itemCount: number;
  className?: string;
}

export function EqualWidthContainer({
  children,
  itemCount,
  className = '',
}: EqualWidthContainerProps) {
  return (
    <div
      className={`${styles.container} ${className}`}
      style={{ '--item-count': itemCount } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
