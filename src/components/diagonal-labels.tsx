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

        // Create a compact single-line canvas config with aggressive memory optimization
        const canvasConfig: CanvasLabelConfig = {
          width: 200,
          height: 40,
          // Force very small texture size for iOS memory constraints
          targetResolution: {
            width: 160,
            height: 32,
          },
          useOptimizedFormat: false, // Keep as RGBA for colored backgrounds
          devicePixelRatio: 1, // Force 1x to prevent memory explosion on iOS
          background: {
            color: 'rgba(96, 96, 96, 0.4)',
            borderRadius: 3,
            padding: 3,
            border: {
              width: 1,
              color: 'rgba(255, 255, 255, 0.8)',
            },
          },
          texts: [
            {
              content: labelData.glyph,
              x: 20,
              y: 20,
              style: {
                fontSize: 22,
                fontFamily: 'FrankRuhlLibre, serif',
                color: 'white',
                textAlign: 'center',
                textBaseline: 'middle',
              },
            },
            {
              content: labelData.letterName,
              x: 50,
              y: 20,
              style: {
                fontSize: 14,
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
              width={200}
              height={40}
              scale={LABEL_SCALE * 0.15}
              useMemoryOptimization={useMemoryOptimization}
            />
          </group>
        );
      })}
    </>
  );
}
