// src/components/diagonal-labels.tsx
import * as React from 'react';
import { diagonals } from '../data/geometry';
import { eulerFromNormalAndTangent } from '../utils/orientation';
import { RichLabel } from './rich-label';
import { EDGE_LABEL_BACKGROUND, LABEL_SCALE } from '../data/label-styles';
import { createLabelData } from '../utils/label-factory';

interface DiagonalLabelsProps {
  useMemoryOptimization?: boolean;
}

export function DiagonalLabels({
  useMemoryOptimization = true,
}: DiagonalLabelsProps): React.JSX.Element {
  return (
    <>
      {diagonals.map((d, i) => {
        const rot = eulerFromNormalAndTangent(d.normal, d.tangent);
        const labelData = createLabelData(d.letter);

        return (
          <group key={i} position={d.pos} rotation={rot}>
            <RichLabel
              title={labelData.title}
              subtitle={labelData.subtitle}
              hebrewLetter={labelData.glyph}
              letterName={labelData.letterName}
              assocGlyph={labelData.assocGlyph}
              assocName={labelData.assocName}
              imagePath={labelData.imagePath}
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
