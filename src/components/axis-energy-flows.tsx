// src/components/axis-energy-flows.tsx
import * as React from 'react';

import { HALF } from '../data/constants';
import type { BaseVisualizationProps } from '../types/component-props';
import { EnergyFlow } from './energy-flow';

interface AxisEnergyFlowsProps extends BaseVisualizationProps {
  speed?: number;
  particleCount?: number;
  flowDirection?: 'center-to-faces' | 'directional';
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
  // Define the three main axis flows
  const axisFlowData = React.useMemo(() => {
    const centerPos = [0, 0, 0] as [number, number, number];

    if (flowDirection === 'center-to-faces') {
      // Each axis has TWO flows emanating from center
      return [
        // Vertical axis (Aleph) - two flows from center
        {
          name: 'vertical-up',
          startPos: centerPos,
          endPos: [0, HALF, 0] as [number, number, number], // Above
          direction: 'positive' as const,
          color: '#ffff00', // Yellow
        },
        {
          name: 'vertical-down',
          startPos: centerPos,
          endPos: [0, -HALF, 0] as [number, number, number], // Below
          direction: 'positive' as const,
          color: '#ffff00', // Yellow
        },
        // Horizontal X axis (Mem) - two flows from center
        {
          name: 'horizontal-x-east',
          startPos: centerPos,
          endPos: [HALF, 0, 0] as [number, number, number], // East
          direction: 'positive' as const,
          color: '#0000ff', // Blue
        },
        {
          name: 'horizontal-x-west',
          startPos: centerPos,
          endPos: [-HALF, 0, 0] as [number, number, number], // West
          direction: 'positive' as const,
          color: '#0000ff', // Blue
        },
        // Horizontal Z axis (Shin) - two flows from center
        {
          name: 'horizontal-z-south',
          startPos: centerPos,
          endPos: [0, 0, HALF] as [number, number, number], // South
          direction: 'positive' as const,
          color: '#ff0000', // Red
        },
        {
          name: 'horizontal-z-north',
          startPos: centerPos,
          endPos: [0, 0, -HALF] as [number, number, number], // North
          direction: 'positive' as const,
          color: '#ff0000', // Red
        },
      ];
    } else {
      // Directional flow: Above to Below, North to South, East to West
      return [
        // Vertical axis (Aleph) - Above to Below
        {
          name: 'vertical-above-to-below',
          startPos: [0, HALF, 0] as [number, number, number], // Above
          endPos: [0, -HALF, 0] as [number, number, number], // Below
          direction: 'positive' as const,
          color: '#ffff00', // Yellow
        },
        // Horizontal Z axis (Shin) - North to South
        {
          name: 'horizontal-z-north-to-south',
          startPos: [0, 0, -HALF] as [number, number, number], // North
          endPos: [0, 0, HALF] as [number, number, number], // South
          direction: 'positive' as const,
          color: '#ff0000', // Red
        },
        // Horizontal X axis (Mem) - East to West
        {
          name: 'horizontal-x-east-to-west',
          startPos: [HALF, 0, 0] as [number, number, number], // East
          endPos: [-HALF, 0, 0] as [number, number, number], // West
          direction: 'positive' as const,
          color: '#0000ff', // Blue
        },
      ];
    }
  }, [flowDirection]);

  if (!visible) {
    return <></>;
  }

  return (
    <group>
      {axisFlowData.map((data) => (
        <EnergyFlow
          key={data.name}
          startPosition={data.startPos}
          endPosition={data.endPos}
          direction={data.direction}
          color={data.color}
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
