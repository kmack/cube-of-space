// src/components/edge-labels.tsx
import * as React from 'react';
import { edges } from '../data/geometry';
import { eulerFromNormalAndTangent } from '../utils/orientation';
import { RichLabel } from './rich-label';
import { EDGE_LABEL_BACKGROUND, LABEL_SCALE } from '../data/label-styles';
import { LABEL_OFFSET } from '../data/constants';
import { createLabelData } from '../utils/label-factory';

interface EdgeLabelsProps {
  useMemoryOptimization?: boolean;
}

function EdgeLabelsComponent({
  useMemoryOptimization = true,
}: EdgeLabelsProps): React.JSX.Element {
  // Memoize edge label data and positions to avoid recalculation
  const edgeLabelInfo = React.useMemo(() => {
    return edges.map((e) => {
      const rot = eulerFromNormalAndTangent(e.normal, e.tangent);
      const labelData = createLabelData(e.letter);
      // Calculate offset position - push label outward from center along edge normal
      const offsetPos: [number, number, number] = [
        e.pos[0] +
          (e.pos[0] > 0 ? LABEL_OFFSET : e.pos[0] < 0 ? -LABEL_OFFSET : 0),
        e.pos[1] +
          (e.pos[1] > 0 ? LABEL_OFFSET : e.pos[1] < 0 ? -LABEL_OFFSET : 0),
        e.pos[2] +
          (e.pos[2] > 0 ? LABEL_OFFSET : e.pos[2] < 0 ? -LABEL_OFFSET : 0),
      ];
      return { labelData, offsetPos, rotation: rot };
    });
  }, []);

  return (
    <>
      {edgeLabelInfo.map((info, i) => {
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
              background={EDGE_LABEL_BACKGROUND}
              hebrewFont="FrankRuhlLibre, serif"
              uiFont="Inter, sans-serif"
              useMemoryOptimization={useMemoryOptimization}
            />
          </group>
        );
      })}
    </>
  );
}

// Memoize component to prevent unnecessary re-renders
export const EdgeLabels = React.memo(EdgeLabelsComponent);
