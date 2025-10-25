// src/components/edge-energy-flows.tsx
import * as React from 'react';

import {
  type EdgeHebrewLetter,
  ENERGY_FLOW_CONFIG,
} from '../data/energy-flow-config';
import type { BaseVisualizationProps } from '../types/component-props';
import { EnergyFlowGeometry } from '../utils/energy-flow-geometry';
import { GeometryRepository } from '../utils/geometry-repository';
import { EnergyFlow } from './energy-flow';

interface EdgeEnergyFlowsProps extends BaseVisualizationProps {
  speed?: number;
  particleCount?: number;
  isAnimationActive?: boolean;
  isMobile?: boolean;
}

export function EdgeEnergyFlows({
  visible = true,
  speed = 1.0,
  particleCount = 8,
  opacity = 0.6,
  isAnimationActive = true,
  isMobile = false,
}: EdgeEnergyFlowsProps): React.JSX.Element {
  // Memoize edge flow calculations using geometry service
  // Separates complex geometric calculations from component logic
  const edgeFlowData = React.useMemo(() => {
    return GeometryRepository.getAllEdges().map((edge) => {
      // Use geometry service to calculate flow positions
      const { startPos, endPos } =
        EnergyFlowGeometry.calculateEdgeFlowPositions(edge);

      return {
        letter: edge.letter,
        startPos,
        endPos,
        direction: ENERGY_FLOW_CONFIG.getDirection(
          edge.letter as EdgeHebrewLetter
        ),
        color: ENERGY_FLOW_CONFIG.getColor(edge.letter as EdgeHebrewLetter),
      };
    });
  }, []); // Empty deps - edge geometry is static

  if (!visible) {
    return <></>;
  }

  return (
    <group>
      {edgeFlowData.map((data) => (
        <EnergyFlow
          key={data.letter}
          startPosition={data.startPos}
          endPosition={data.endPos}
          direction={data.direction}
          color={data.color}
          particleCount={particleCount}
          speed={speed}
          opacity={opacity}
          particleSize={0.015}
          isAnimationActive={isAnimationActive}
          isMobile={isMobile}
        />
      ))}
    </group>
  );
}
