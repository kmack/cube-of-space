/**
 * @fileoverview Edge labels component rendering Hebrew letters on cube edges
 * (Simple letters/zodiacal correspondences).
 */

// src/components/edge-labels.tsx
import * as React from 'react';

import { EDGE_LABEL_BACKGROUND, LABEL_SCALE } from '../data/label-styles';
import { GeometryRepository } from '../utils/geometry-repository';
import { createLabelData } from '../utils/label-factory';
import type { BaseLabelProps } from '../utils/label-utils';
import { calculateAxisAlignedOffset } from '../utils/label-utils';
import { eulerFromNormalAndTangent } from '../utils/orientation';
import { StandardRichLabel } from './standard-rich-label';

type EdgeLabelsProps = BaseLabelProps;

function EdgeLabelsComponent({
  useMemoryOptimization = true,
  doubleSided = false,
  showColorBorders = true,
}: EdgeLabelsProps): React.JSX.Element {
  // Memoize edge label data and positions to avoid recalculation
  const edgeLabelInfo = React.useMemo(() => {
    return GeometryRepository.getAllEdges().map((e) => {
      const rot = eulerFromNormalAndTangent(e.normal, e.tangent);
      const labelData = createLabelData(e.letter);
      // Calculate offset position - push label outward from center along edge normal
      const offsetPos = calculateAxisAlignedOffset(e.pos);
      return { labelData, offsetPos, rotation: rot };
    });
  }, []);

  return (
    <>
      {edgeLabelInfo.map((info, i) => {
        return (
          <group key={i} position={info.offsetPos} rotation={info.rotation}>
            <StandardRichLabel
              labelData={info.labelData}
              scale={LABEL_SCALE}
              background={EDGE_LABEL_BACKGROUND}
              useMemoryOptimization={useMemoryOptimization}
              doubleSided={doubleSided}
              showColorBorders={showColorBorders}
            />
          </group>
        );
      })}
    </>
  );
}

// Memoize component to prevent unnecessary re-renders
export const EdgeLabels = React.memo(EdgeLabelsComponent);
