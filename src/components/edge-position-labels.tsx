// src/components/edge-position-labels.tsx
import { Billboard } from '@react-three/drei';
import * as React from 'react';
import * as THREE from 'three';

import { EDGE_POSITION_LABEL_OFFSET } from '../data/constants';
import { edges } from '../data/geometry';
import { LABEL_SCALE } from '../data/label-styles';
import type { PositionedComponentProps } from '../types/component-props';
import type { CanvasLabelConfig } from '../utils/canvas-texture';
import { RichLabel } from './rich-label';

// Map Hebrew letters to their geometric position descriptions
const POSITION_LABELS: Record<string, string> = {
  // Corner verticals
  Heh: 'Northeast',
  Vav: 'Southeast',
  Lamed: 'Northwest',
  Nun: 'Southwest',

  // East face edges
  Zain: 'East Above',
  Cheth: 'East Below',

  // North face edges
  Teth: 'North Above',
  Yod: 'North Below',

  // West face edges
  Samekh: 'West Above',
  Ayin: 'West Below',

  // South face edges
  Tzaddi: 'South Above',
  Qoph: 'South Below',
};

type EdgePositionLabelsProps = PositionedComponentProps;

export function EdgePositionLabels({
  visible = true,
  fontSize: _fontSize = 0.08,
  color = '#cccccc',
}: EdgePositionLabelsProps): React.JSX.Element {
  if (!visible) {
    return <></>;
  }

  return (
    <group>
      {edges.map((edge) => {
        const positionText = POSITION_LABELS[edge.letter];
        if (!positionText) return null;

        // Calculate position with offset to avoid overlap with edge labels
        const positionOffset = EDGE_POSITION_LABEL_OFFSET;
        const offsetPos: [number, number, number] = [
          edge.pos[0] +
            (edge.pos[0] > 0
              ? positionOffset
              : edge.pos[0] < 0
                ? -positionOffset
                : 0),
          edge.pos[1] +
            (edge.pos[1] > 0
              ? positionOffset
              : edge.pos[1] < 0
                ? -positionOffset
                : 0),
          edge.pos[2] +
            (edge.pos[2] > 0
              ? positionOffset
              : edge.pos[2] < 0
                ? -positionOffset
                : 0),
        ];

        return (
          <Billboard
            key={`${edge.letter}-position`}
            position={offsetPos}
            follow={true}
            lockX={false}
            lockY={false}
            lockZ={false}
          >
            <RichLabel
              title={positionText}
              color={color}
              scale={LABEL_SCALE * 0.5}
              width={256}
              height={64}
              uiFont="Inter, sans-serif"
              renderOrder={1}
              materialSide={THREE.DoubleSide}
              depthTest={false}
              flipY={true}
              canvasConfig={
                {
                  width: 256,
                  height: 64,
                  devicePixelRatio: 1,
                  useOptimizedFormat: false,
                  background: { color: 'transparent' },
                  texts: [
                    {
                      content: positionText,
                      x: 128,
                      y: 32,
                      style: {
                        fontSize: 22,
                        fontFamily: 'Inter, sans-serif',
                        color,
                        textAlign: 'center',
                        textBaseline: 'middle',
                      },
                    },
                  ],
                } as CanvasLabelConfig
              }
            />
          </Billboard>
        );
      })}
    </group>
  );
}
