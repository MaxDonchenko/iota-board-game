import styles from './WildCardRecycleButton.module.css';

interface WildCardRecycleButtonProps {
  onClick: () => void;
}

export function WildCardRecycleButton({ onClick }: WildCardRecycleButtonProps) {
  return (
    <button onClick={onClick} className={styles.recycleButton}>
      Recycle Wild Card
    </button>
  );
}

