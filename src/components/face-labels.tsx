// src/components/face-labels.tsx
import { Billboard } from '@react-three/drei';
import * as React from 'react';

import { center, faces } from '../data/geometry';
import { FACE_LABEL_BACKGROUND, LABEL_SCALE } from '../data/label-styles';
import { createLabelData } from '../utils/label-factory';
import type { BaseLabelProps } from '../utils/label-utils';
import { calculateAxisAlignedOffset, useLabelData } from '../utils/label-utils';
import { StandardRichLabel } from './standard-rich-label';

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
            <StandardRichLabel
              labelData={info.labelData}
              scale={LABEL_SCALE}
              background={FACE_LABEL_BACKGROUND}
              useMemoryOptimization={useMemoryOptimization}
              doubleSided={doubleSided}
              showColorBorders={showColorBorders}
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
        <StandardRichLabel
          labelData={centerLabelData}
          scale={LABEL_SCALE}
          background={FACE_LABEL_BACKGROUND}
          useMemoryOptimization={useMemoryOptimization}
          doubleSided={doubleSided}
          showColorBorders={showColorBorders}
        />
      </Billboard>
    </>
  );
}

// Memoize component to prevent unnecessary re-renders
export const FaceLabels = React.memo(FaceLabelsComponent);
