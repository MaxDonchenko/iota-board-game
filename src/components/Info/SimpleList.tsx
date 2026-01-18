import { ReactNode } from 'react';
import styles from './SimpleList.module.css';

interface SimpleListProps {
  title?: string;
  items: (string | ReactNode)[];
}

export function SimpleList({ title, items }: SimpleListProps) {
  return (
    <div className={styles.container}>
      {title && <h3 className={styles.title}>{title}</h3>}
      <ul className={styles.list}>
        {items.map((item, index) => (
          <li key={index} className={styles.item}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
