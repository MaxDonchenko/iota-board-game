import { useState, useCallback } from 'react';

const SCALES = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2.0];
const DEFAULT_SCALE_INDEX = 2; // 1.0

export function useBoardScale() {
  const [scaleIndex, setScaleIndex] = useState(DEFAULT_SCALE_INDEX);

  const zoomIn = useCallback(() => {
    setScaleIndex((prev) => Math.min(SCALES.length - 1, prev + 1));
  }, []);

  const zoomOut = useCallback(() => {
    setScaleIndex((prev) => Math.max(0, prev - 1));
  }, []);

  return {
    scale: SCALES[scaleIndex],
    canZoomIn: scaleIndex < SCALES.length - 1,
    canZoomOut: scaleIndex > 0,
    zoomIn,
    zoomOut,
  };
}
