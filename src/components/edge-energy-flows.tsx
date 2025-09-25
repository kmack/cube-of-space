// src/components/edge-energy-flows.tsx
import * as React from 'react';
import * as THREE from 'three';
import { EnergyFlow } from './energy-flow';
import { edges } from '../data/geometry';
import { HALF } from '../data/constants';
import {
  ENERGY_FLOW_CONFIG,
  type EdgeHebrewLetter,
} from '../data/energy-flow-config';

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
            startPos = edgePos.clone().add(startOffset).toArray() as [
              number,
              number,
              number,
            ];
            endPos = edgePos.clone().add(endOffset).toArray() as [
              number,
              number,
              number,
            ];
          }
        }

        return (
          <EnergyFlow
            key={edge.letter}
            startPosition={startPos}
            endPosition={endPos}
            direction={ENERGY_FLOW_CONFIG.getDirection(
              edge.letter as EdgeHebrewLetter
            )}
            color={ENERGY_FLOW_CONFIG.getColor(edge.letter as EdgeHebrewLetter)}
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
