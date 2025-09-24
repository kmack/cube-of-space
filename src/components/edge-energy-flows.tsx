// src/components/edge-energy-flows.tsx
import * as React from 'react';
import * as THREE from 'three';
import { EnergyFlow, type FlowDirection } from './energy-flow';
import { edges } from '../data/geometry';
import { HALF } from '../data/constants';

// Define energy flow directions based on specified directional requirements
const FLOW_DIRECTIONS: Record<string, FlowDirection> = {
  // Corner verticals
  'Heh': 'positive',    // NE - (not specified, keeping positive)
  'Vav': 'positive',    // SE - Below to Above (positive = upward)
  'Lamed': 'negative',  // NW - Above to Below (negative = downward)
  'Nun': 'positive',    // SW - Below to Above (positive = upward)

  // Face edges - horizontal flows
  'Zain': 'negative',   // East Above - South to North (negative along Z tangent [0,0,-1])
  'Cheth': 'negative',  // East Below - (not specified, keeping negative)

  'Teth': 'negative',   // North Above - East to West (negative along X tangent [-1,0,0])
  'Yod': 'positive',    // North Below - (not specified, keeping positive)

  'Samekh': 'positive', // West Above - North to South (positive along Z tangent [0,0,+1])
  'Ayin': 'positive',   // West Below - North to South (positive along Z tangent [0,0,+1])

  'Tzaddi': 'positive', // South Above - West to East (positive along X tangent [+1,0,0])
  'Qoph': 'positive',   // South Below - West to East (positive along X tangent [+1,0,0])
};

// Color coding based on Hebrew letter dimensional correspondences
const FLOW_COLORS: Record<string, string> = {
  // Corner verticals (edges)
  'Heh': '#ff0000',      // Red (Northeastern Edge)
  'Vav': '#ff4500',      // Red-Orange (Southeastern Edge)
  'Lamed': '#00ff00',    // Green (Northwestern Edge)
  'Nun': '#00ffaa',      // Blue-Green (Southwestern Edge)

  // East face edges
  'Zain': '#ffa500',     // Orange (East Above Edge)
  'Cheth': '#ffcc00',    // Yellow-Orange (East Below Edge)

  // North face edges
  'Teth': '#ffff00',     // Yellow (North Above Edge)
  'Yod': '#aaff00',      // Yellow-Green (North Below Edge)

  // West face edges
  'Samekh': '#0000ff',   // Blue (West Above Edge)
  'Ayin': '#4400ff',     // Blue-Violet (West Below Edge)

  // South face edges
  'Tzaddi': '#8800ff',   // Violet (South Above Edge)
  'Qoph': '#ff00aa',     // Red-Violet (South Below Edge)
};

type EdgeEnergyFlowsProps = {
  visible?: boolean;
  speed?: number;
  particleCount?: number;
  opacity?: number;
};

export function EdgeEnergyFlows({
  visible = true,
  speed = 1.0,
  particleCount = 8,
  opacity = 0.6,
}: EdgeEnergyFlowsProps): React.JSX.Element {
  if (!visible) {
    return <></>;
  }

  return (
    <group>
      {edges.map((edge) => {
        // Calculate start and end positions along the edge's tangent vector
        const edgePos = new THREE.Vector3(...edge.pos);
        const tangent = new THREE.Vector3(...edge.tangent);

        // For vertical edges, flow from bottom to top
        // For horizontal edges, flow along their tangent direction
        let startPos: [number, number, number];
        let endPos: [number, number, number];

        if (Math.abs(tangent.y) > 0.9) {
          // Vertical edge - flow from bottom to top
          startPos = [edge.pos[0], -HALF, edge.pos[2]];
          endPos = [edge.pos[0], +HALF, edge.pos[2]];
        } else {
          // Horizontal edge - flow along tangent
          // Calculate proper edge positions based on cube geometry
          if (Math.abs(tangent.x) > 0.9) {
            // Edge runs along X axis (East-West direction)
            startPos = [-HALF, edge.pos[1], edge.pos[2]];
            endPos = [+HALF, edge.pos[1], edge.pos[2]];
          } else if (Math.abs(tangent.z) > 0.9) {
            // Edge runs along Z axis (North-South direction)
            startPos = [edge.pos[0], edge.pos[1], -HALF];
            endPos = [edge.pos[0], edge.pos[1], +HALF];
          } else {
            // Fallback - use original tangent calculation with smaller length
            const tangentLength = HALF * 0.8; // Reduce overflow
            const startOffset = tangent.clone().multiplyScalar(-tangentLength);
            const endOffset = tangent.clone().multiplyScalar(tangentLength);
            startPos = edgePos.clone().add(startOffset).toArray() as [number, number, number];
            endPos = edgePos.clone().add(endOffset).toArray() as [number, number, number];
          }
        }

        return (
          <EnergyFlow
            key={edge.letter}
            startPosition={startPos}
            endPosition={endPos}
            direction={FLOW_DIRECTIONS[edge.letter]}
            color={FLOW_COLORS[edge.letter]}
            particleCount={particleCount}
            speed={speed}
            opacity={opacity}
            particleSize={0.015}
          />
        );
      })}
    </group>
  );
}