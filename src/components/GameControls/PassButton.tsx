import styles from './PassButton.module.css';

interface PassButtonProps {
  onClick: () => void;
}

export function PassButton({ onClick }: PassButtonProps) {
  return (
    <button 
      onClick={() => {
        if (window.confirm('Are you sure you want to pass your turn?')) {
          onClick();
        }
      }} 
      className={styles.passButton}
    >
      Pass
    </button>
  );
}

