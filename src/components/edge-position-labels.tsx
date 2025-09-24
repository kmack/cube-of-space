// src/components/edge-position-labels.tsx
import * as React from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { edges } from '../data/geometry';

// Map Hebrew letters to their geometric position descriptions
const POSITION_LABELS: Record<string, string> = {
  // Corner verticals
  'Heh': 'Northeast',
  'Vav': 'Southeast',
  'Lamed': 'Northwest',
  'Nun': 'Southwest',

  // East face edges
  'Zain': 'East Above',
  'Cheth': 'East Below',

  // North face edges
  'Teth': 'North Above',
  'Yod': 'North Below',

  // West face edges
  'Samekh': 'West Above',
  'Ayin': 'West Below',

  // South face edges
  'Tzaddi': 'South Above',
  'Qoph': 'South Below',
};

type EdgePositionLabelsProps = {
  visible?: boolean;
  fontSize?: number;
  color?: string;
  offset?: number;
};

export function EdgePositionLabels({
  visible = true,
  fontSize = 0.08,
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

        // Calculate rotation to face the camera optimally
        // For edge labels, we'll use a slight offset from the normal direction

        return (
          <Text
            key={`${edge.letter}-position`}
            position={labelPos.toArray() as [number, number, number]}
            fontSize={fontSize}
            color={color}
            anchorX="center"
            anchorY="middle"
            font="/fonts/Inter-VariableFont_opsz,wght.ttf"
            // Slightly rotate text to be more readable from typical viewing angles
            rotation={[0, 0, 0]}
            // Make text face the camera
            lookAt={[0, 0, 10]}
          >
            {positionText}
          </Text>
        );
      })}
    </group>
  );
}