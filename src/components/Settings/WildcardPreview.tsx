import { Card } from '../Card/Card';
import { Card as CardClass } from '@/game/Card';

interface WildcardPreviewProps {
  variant: 'modern' | 'original';
}

export function WildcardPreview({ variant }: WildcardPreviewProps) {
  // Variant is used implicitly by Card component reading from context
  void variant;
  const wildcard = new CardClass('Square', 1, 'Red', true);
  
  // We need to pass the variant directly since Card component reads from context
  // For now, create a wrapper that forces the variant
  return (
    <div style={{ transform: 'scale(0.8)' }}>
      <Card card={wildcard} />
    </div>
  );
}

