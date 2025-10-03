// src/components/diagonal-labels.tsx
import * as React from 'react';
import { diagonals } from '../data/geometry';
import { eulerFromNormalAndTangent } from '../utils/orientation';
import { RichLabel } from './rich-label';
import { LABEL_SCALE } from '../data/label-styles';
import { createLabelData } from '../utils/label-factory';
import type { CanvasLabelConfig } from '../utils/canvas-texture';

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

        // Create a compact single-line canvas config
        const canvasConfig: CanvasLabelConfig = {
          width: 250,
          height: 50,
          background: {
            color: 'rgba(96, 96, 96, 0.4)',
            opacity: 0.45,
            borderRadius: 4,
            padding: 4,
            border: {
              width: 1,
              color: 'rgba(255, 255, 255, 0.8)',
            },
          },
          texts: [
            {
              content: labelData.glyph,
              x: 30,
              y: 25,
              style: {
                fontSize: 28,
                fontFamily: 'FrankRuhlLibre, serif',
                color: 'white',
                textAlign: 'center',
                textBaseline: 'middle',
              },
            },
            {
              content: labelData.letterName,
              x: 65,
              y: 25,
              style: {
                fontSize: 16,
                fontFamily: 'Inter, sans-serif',
                color: 'white',
                textAlign: 'left',
                textBaseline: 'middle',
              },
            },
          ],
        };

        return (
          <group key={i} position={d.pos} rotation={rot}>
            <RichLabel
              title=""
              canvasConfig={canvasConfig}
              width={250}
              height={50}
              scale={LABEL_SCALE * 0.4}
              useMemoryOptimization={useMemoryOptimization}
            />
          </group>
        );
      })}
    </>
  );
}
