import { useTheme } from '@/context/ThemeContext';
import { ColorUtils } from '@/utils/colors';
import styles from './PassButton.module.css';

interface PassButtonProps {
  onClick: () => void;
}

export function PassButton({ onClick }: PassButtonProps) {
  const { settings } = useTheme();
  const blueColor = ColorUtils.getSolidColor('Blue', settings.theme);
  
  return (
    <button 
      onClick={() => {
        if (window.confirm('Are you sure you want to pass your turn?')) {
          onClick();
        }
      }} 
      className={styles.passButton}
      style={{ backgroundColor: blueColor }}
    >
      Pass
    </button>
  );
}

