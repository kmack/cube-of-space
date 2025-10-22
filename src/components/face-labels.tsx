// src/components/face-labels.tsx
import { Billboard } from '@react-three/drei';
import * as React from 'react';

import { center, faces } from '../data/geometry';
import { FACE_LABEL_BACKGROUND, LABEL_SCALE } from '../data/label-styles';
import { createLabelData } from '../utils/label-factory';
import type { BaseLabelProps } from '../utils/label-utils';
import {
  calculateAxisAlignedOffset,
  LABEL_FONTS,
  useLabelData,
} from '../utils/label-utils';
import { RichLabel } from './rich-label';

type FaceLabelsProps = BaseLabelProps;

function FaceLabelsComponent({
  useMemoryOptimization = true,
  doubleSided = false,
  showColorBorders = true,
}: FaceLabelsProps): React.JSX.Element {
  // Memoize center label data to avoid recreation on every render
  const centerLabelData = useLabelData(center.letter);

  // Memoize face label data and positions
  const faceLabelInfo = React.useMemo(() => {
    return faces.map((f) => {
      const labelData = createLabelData(f.letter);
      // Calculate offset position - push label outward from center along face normal
      const offsetPos = calculateAxisAlignedOffset(f.pos);
      return { labelData, offsetPos, rotation: f.rotation };
    });
  }, []);

  return (
    <>
      {/* Regular face labels */}
      {faceLabelInfo.map((info, i) => {
        return (
          <group key={i} position={info.offsetPos} rotation={info.rotation}>
            <RichLabel
              title={info.labelData.title}
              subtitle={info.labelData.subtitle}
              hebrewLetter={info.labelData.glyph}
              letterName={info.labelData.letterName}
              assocGlyph={info.labelData.assocGlyph}
              assocName={info.labelData.assocName}
              colorName={info.labelData.color}
              colorValue={info.labelData.colorValue}
              note={info.labelData.note}
              significance={info.labelData.significance}
              gematria={info.labelData.gematria}
              alchemy={info.labelData.alchemy}
              intelligence={info.labelData.intelligence}
              showColorBorders={showColorBorders}
              imagePath={info.labelData.imagePath}
              scale={LABEL_SCALE}
              background={FACE_LABEL_BACKGROUND}
              hebrewFont={LABEL_FONTS.hebrew}
              uiFont={LABEL_FONTS.ui}
              useMemoryOptimization={useMemoryOptimization}
              doubleSided={doubleSided}
            />
          </group>
        );
      })}

      {/* Center label as billboard - always faces viewer */}
      <Billboard
        follow={true}
        lockX={false}
        lockY={false}
        lockZ={false}
        position={center.pos}
      >
        <RichLabel
          title={centerLabelData.title}
          subtitle={centerLabelData.subtitle}
          hebrewLetter={centerLabelData.glyph}
          letterName={centerLabelData.letterName}
          assocGlyph={centerLabelData.assocGlyph}
          assocName={centerLabelData.assocName}
          colorName={centerLabelData.color}
          colorValue={centerLabelData.colorValue}
          note={centerLabelData.note}
          significance={centerLabelData.significance}
          gematria={centerLabelData.gematria}
          alchemy={centerLabelData.alchemy}
          intelligence={centerLabelData.intelligence}
          showColorBorders={showColorBorders}
          imagePath={centerLabelData.imagePath}
          scale={LABEL_SCALE}
          background={FACE_LABEL_BACKGROUND}
          hebrewFont={LABEL_FONTS.hebrew}
          uiFont={LABEL_FONTS.ui}
          useMemoryOptimization={useMemoryOptimization}
          doubleSided={doubleSided}
        />
      </Billboard>
    </>
  );
}

// Memoize component to prevent unnecessary re-renders
export const FaceLabels = React.memo(FaceLabelsComponent);
