// src/components/face-labels.tsx
import { Billboard } from '@react-three/drei';
import * as React from 'react';

import { LABEL_OFFSET } from '../data/constants';
import { center, faces } from '../data/geometry';
import { FACE_LABEL_BACKGROUND, LABEL_SCALE } from '../data/label-styles';
import { createLabelData } from '../utils/label-factory';
import { RichLabel } from './rich-label';

interface FaceLabelsProps {
  useMemoryOptimization?: boolean;
}

function FaceLabelsComponent({
  useMemoryOptimization = true,
}: FaceLabelsProps): React.JSX.Element {
  // Memoize label data to avoid recreation on every render
  const centerLabelData = React.useMemo(
    () => createLabelData(center.letter),
    []
  );

  // Memoize face label data and positions
  const faceLabelInfo = React.useMemo(() => {
    return faces.map((f) => {
      const labelData = createLabelData(f.letter);
      // Calculate offset position - push label outward from center along face normal
      const offsetPos: [number, number, number] = [
        f.pos[0] +
          (f.pos[0] > 0 ? LABEL_OFFSET : f.pos[0] < 0 ? -LABEL_OFFSET : 0),
        f.pos[1] +
          (f.pos[1] > 0 ? LABEL_OFFSET : f.pos[1] < 0 ? -LABEL_OFFSET : 0),
        f.pos[2] +
          (f.pos[2] > 0 ? LABEL_OFFSET : f.pos[2] < 0 ? -LABEL_OFFSET : 0),
      ];
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
              imagePath={info.labelData.imagePath}
              scale={LABEL_SCALE}
              background={FACE_LABEL_BACKGROUND}
              hebrewFont="FrankRuhlLibre, serif"
              uiFont="Inter, sans-serif"
              useMemoryOptimization={useMemoryOptimization}
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
          imagePath={centerLabelData.imagePath}
          scale={LABEL_SCALE}
          background={FACE_LABEL_BACKGROUND}
          hebrewFont="FrankRuhlLibre, serif"
          uiFont="Inter, sans-serif"
          useMemoryOptimization={useMemoryOptimization}
        />
      </Billboard>
    </>
  );
}

// Memoize component to prevent unnecessary re-renders
export const FaceLabels = React.memo(FaceLabelsComponent);
