// src/components/edge-position-labels.tsx
import * as React from 'react';
import * as THREE from 'three';
import { Billboard } from '@react-three/drei';
import { edges } from '../data/geometry';
import type { PositionedComponentProps } from '../types/component-props';
import { RichLabel } from './rich-label';
import { LABEL_SCALE } from '../data/label-styles';
import { LABEL_OFFSET } from '../data/constants';
import type { CanvasLabelConfig } from '../utils/canvas-texture';

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

interface EdgePositionLabelsProps extends PositionedComponentProps {
  // All props inherited from PositionedComponentProps
}

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

        // Calculate position from a lower origin to move labels down
        const positionOffset = LABEL_OFFSET * 10; // Larger offset to avoid overlap with edge labels
        const originY = -0.5; // Lower origin point for positioning
        const offsetPos: [number, number, number] = [
          edge.pos[0] +
            (edge.pos[0] > 0
              ? positionOffset
              : edge.pos[0] < 0
                ? -positionOffset
                : 0),
          originY +
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
              flipY={false}
              canvasConfig={{
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
              } as CanvasLabelConfig}
            />
          </Billboard>
        );
      })}
    </group>
  );
}
