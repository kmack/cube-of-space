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
  useUpscalingShader?: boolean;
}

export function EdgeLabels({
  useMemoryOptimization = true,
  useUpscalingShader = true,
}: EdgeLabelsProps): React.JSX.Element {
  return (
    <>
      {edges.map((e, i) => {
        const rot = eulerFromNormalAndTangent(e.normal, e.tangent);
        const labelData = createLabelData(e.letter);
        // Calculate offset position - push label outward from center along edge normal
        const offsetPos: [number, number, number] = [
          e.pos[0] + (e.pos[0] > 0 ? LABEL_OFFSET : e.pos[0] < 0 ? -LABEL_OFFSET : 0),
          e.pos[1] + (e.pos[1] > 0 ? LABEL_OFFSET : e.pos[1] < 0 ? -LABEL_OFFSET : 0),
          e.pos[2] + (e.pos[2] > 0 ? LABEL_OFFSET : e.pos[2] < 0 ? -LABEL_OFFSET : 0),
        ];
        return (
          <group key={i} position={offsetPos} rotation={rot}>
            <RichLabel
              title={labelData.title}
              subtitle={labelData.subtitle}
              hebrewLetter={labelData.glyph}
              imagePath={labelData.imagePath}
              scale={LABEL_SCALE}
              background={EDGE_LABEL_BACKGROUND}
              hebrewFont="FrankRuhlLibre, serif"
              uiFont="Inter, sans-serif"
              useMemoryOptimization={useMemoryOptimization}
              useUpscalingShader={useUpscalingShader}
            />
          </group>
        );
      })}
    </>
  );
}
