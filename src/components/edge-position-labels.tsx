// src/components/edge-position-labels.tsx
import * as React from 'react';
import * as THREE from 'three';
import { Billboard } from '@react-three/drei';
import { edges } from '../data/geometry';
import type { PositionedComponentProps } from '../types/component-props';
import { RichLabel } from './rich-label';
import { LABEL_SCALE } from '../data/label-styles';

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
  offset = 0.3,
}: EdgePositionLabelsProps): React.JSX.Element {
  if (!visible) {
    return <></>;
  }

  return (
    <group>
      {edges.map((edge) => {
        const positionText = POSITION_LABELS[edge.letter];
        if (!positionText) return null;

        // Calculate label position offset from the edge
        const edgePos = new THREE.Vector3(...edge.pos);
        const normal = new THREE.Vector3(...edge.normal).normalize();
        const labelPos = edgePos.clone().add(normal.multiplyScalar(offset));

        // Adjust Y position to center labels better (lower them slightly)
        labelPos.y -= 0.1;

        return (
          <Billboard
            key={`${edge.letter}-position`}
            position={labelPos.toArray() as [number, number, number]}
            follow={true}
            lockX={false}
            lockY={false}
            lockZ={false}
          >
            <RichLabel
              title={positionText}
              color={color}
              scale={LABEL_SCALE * 2.5}
              background={{ color: 'transparent' }}
              uiFont="Inter, sans-serif"
            />
          </Billboard>
        );
      })}
    </group>
  );
}
