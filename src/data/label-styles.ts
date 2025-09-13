// src/data/label-styles.ts
import type { BackgroundStyle } from '../utils/canvas-texture';

// Shared background styles for all label types
export const LABEL_BACKGROUND_BASE: BackgroundStyle = {
  color: 'rgba(96, 96, 96, 0.4)',
  opacity: 0.45,
  padding: 12,
  border: {
    width: 1,
    color: 'rgba(255, 255, 255, 0.8)',
  },
};

// Face labels styling
export const FACE_LABEL_BACKGROUND: BackgroundStyle = {
  ...LABEL_BACKGROUND_BASE,
  borderRadius: 8,
};

// Edge labels styling
export const EDGE_LABEL_BACKGROUND: BackgroundStyle = {
  ...LABEL_BACKGROUND_BASE,
  borderRadius: 6,
  padding: 10,
};

// Mother labels styling
export const MOTHER_LABEL_BACKGROUND: BackgroundStyle = {
  ...LABEL_BACKGROUND_BASE,
  borderRadius: 8,
  opacity: 0.475, // Slightly higher opacity for mother labels
};

// Shared scale for all labels
export const LABEL_SCALE = 0.375;