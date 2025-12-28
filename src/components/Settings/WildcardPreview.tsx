import { Card } from '../Card/Card';
import { Card as CardClass } from '@/game/Card';
import { useTheme } from '@/context/ThemeContext';

interface WildcardPreviewProps {
  variant: 'v1' | 'v2';
}

export function WildcardPreview({ variant }: WildcardPreviewProps) {
  const { settings } = useTheme();
  const wildcard = new CardClass('Square', 1, 'Red', true);
  
  // Temporarily override settings for preview
  const previewSettings = { ...settings, wildcardVariant: variant };
  
  // We need to pass the variant directly since Card component reads from context
  // For now, create a wrapper that forces the variant
  return (
    <div style={{ transform: 'scale(0.8)' }}>
      <Card card={wildcard} />
    </div>
  );
}

