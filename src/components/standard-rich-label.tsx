// src/components/standard-rich-label.tsx
import * as React from 'react';

import type { LabelData } from '../types/component-props';
import type { BackgroundStyle } from '../utils/canvas-texture';
import { LABEL_FONTS } from '../utils/label-utils';
import { RichLabel } from './rich-label';

/**
 * Props for StandardRichLabel component
 * Provides a simplified interface for rendering RichLabel with label data
 */
export interface StandardRichLabelProps {
  labelData: LabelData;
  scale: number;
  background: BackgroundStyle;
  useMemoryOptimization?: boolean;
  doubleSided?: boolean;
  showColorBorders?: boolean;
}

/**
 * StandardRichLabel - Wrapper component that eliminates RichLabel prop mapping duplication
 *
 * This component encapsulates the common pattern of mapping LabelData to RichLabel props,
 * which was previously duplicated across FaceLabels, EdgeLabels, and MotherLabels.
 *
 * Benefits:
 * - Single source of truth for label rendering
 * - Reduces boilerplate from ~20 lines to 1 line per label
 * - Changes to label structure apply uniformly across all label types
 * - Easier to maintain and debug
 *
 * @example
 * ```tsx
 * <StandardRichLabel
 *   labelData={createLabelData('Aleph')}
 *   scale={LABEL_SCALE}
 *   background={FACE_LABEL_BACKGROUND}
 *   useMemoryOptimization={true}
 *   doubleSided={false}
 *   showColorBorders={true}
 * />
 * ```
 */
function StandardRichLabelComponent({
  labelData,
  scale,
  background,
  useMemoryOptimization = true,
  doubleSided = false,
  showColorBorders = true,
}: StandardRichLabelProps): React.JSX.Element {
  return (
    <RichLabel
      title={labelData.title}
      subtitle={labelData.subtitle}
      hebrewLetter={labelData.glyph}
      letterName={labelData.letterName}
      assocGlyph={labelData.assocGlyph}
      assocName={labelData.assocName}
      colorName={labelData.color}
      colorValue={labelData.colorValue}
      note={labelData.note}
      significance={labelData.significance}
      gematria={labelData.gematria}
      alchemy={labelData.alchemy}
      intelligence={labelData.intelligence}
      outerPlanet={labelData.outerPlanet}
      outerPlanetGlyph={labelData.outerPlanetGlyph}
      showColorBorders={showColorBorders}
      imagePath={labelData.imagePath}
      scale={scale}
      background={background}
      hebrewFont={LABEL_FONTS.hebrew}
      uiFont={LABEL_FONTS.ui}
      useMemoryOptimization={useMemoryOptimization}
      doubleSided={doubleSided}
    />
  );
}

// Memoize component to prevent unnecessary re-renders
// Only re-renders when labelData reference, scale, or flags change
export const StandardRichLabel = React.memo(StandardRichLabelComponent);
