/**
 * @fileoverview Axis energy flows component rendering bidirectional particle flows
 * along the three Mother letter axes with configurable flow patterns.
 */

// src/components/axis-energy-flows.tsx
import * as React from 'react';

import {
  AXIS_ENERGY_FLOW_CONFIG,
  type AxisFlowPattern,
} from '../data/axis-energy-flow-config';
import type { BaseVisualizationProps } from '../types/component-props';
import { EnergyFlow } from './energy-flow';

interface AxisEnergyFlowsProps extends BaseVisualizationProps {
  speed?: number;
  particleCount?: number;
  flowDirection?: AxisFlowPattern;
  isAnimationActive?: boolean;
  isMobile?: boolean;
}

export function AxisEnergyFlows({
  visible = true,
  speed = 1.0,
  particleCount = 8,
  opacity = 0.6,
  flowDirection = 'center-to-faces',
  isAnimationActive = true,
  isMobile = false,
}: AxisEnergyFlowsProps): React.JSX.Element {
  // Get axis flow configuration from centralized service
  const axisFlowData = React.useMemo(
    () => AXIS_ENERGY_FLOW_CONFIG.getFlowSegments(flowDirection),
    [flowDirection]
  );

  if (!visible) {
    return <></>;
  }

  return (
    <group>
      {axisFlowData.map((segment) => (
        <EnergyFlow
          key={segment.name}
          startPosition={segment.startPos}
          endPosition={segment.endPos}
          direction={segment.direction}
          color={segment.color}
          particleCount={particleCount}
          speed={speed}
          opacity={opacity}
          particleSize={0.02} // Slightly larger for central axes
          isAnimationActive={isAnimationActive}
          isMobile={isMobile}
        />
      ))}
    </group>
  );
}
