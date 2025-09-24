// src/components/edge-energy-flows.tsx
import * as React from 'react';
import * as THREE from 'three';
import { EnergyFlow, type FlowDirection } from './energy-flow';
import { edges } from '../data/geometry';
import { HALF } from '../data/constants';

// Define energy flow directions based on Hebrew letter correspondences and mystical principles
const FLOW_DIRECTIONS: Record<string, FlowDirection> = {
  // Corner verticals (upward energy - aspiration)
  'Heh': 'positive',   // NE - ascension
  'Vav': 'positive',   // SE - ascension
  'Lamed': 'positive', // NW - ascension
  'Nun': 'positive',   // SW - ascension

  // East face edges (solar/active energy - clockwise when viewed from outside)
  'Zain': 'positive',  // East-Above - rightward
  'Cheth': 'negative', // East-Below - leftward

  // North face edges (mental/air energy - rightward flow)
  'Teth': 'positive',  // North-Above - rightward
  'Yod': 'positive',   // North-Below - rightward

  // West face edges (passive/reflective energy - counter-clockwise)
  'Samekh': 'negative', // West-Above - leftward
  'Ayin': 'positive',   // West-Below - rightward

  // South face edges (emotional/fire energy - leftward flow)
  'Tzaddi': 'negative', // South-Above - leftward
  'Qoph': 'negative',   // South-Below - leftward
};

// Color coding based on energy types
const FLOW_COLORS: Record<string, string> = {
  // Corner verticals - violet/spiritual energy
  'Heh': '#9966ff',   'Vav': '#9966ff',   'Lamed': '#9966ff',   'Nun': '#9966ff',

  // East face - golden/solar energy
  'Zain': '#ffcc00',  'Cheth': '#ffcc00',

  // North face - cyan/air energy
  'Teth': '#00ffff',  'Yod': '#00ffff',

  // West face - blue/lunar energy
  'Samekh': '#4444ff', 'Ayin': '#4444ff',

  // South face - red/fire energy
  'Tzaddi': '#ff4444', 'Qoph': '#ff4444',
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