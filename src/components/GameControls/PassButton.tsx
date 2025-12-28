import styles from './PassButton.module.css';

interface PassButtonProps {
  onClick: () => void;
}

export function PassButton({ onClick }: PassButtonProps) {
  return (
    <button onClick={onClick} className={styles.passButton}>
      Pass
    </button>
  );
}

