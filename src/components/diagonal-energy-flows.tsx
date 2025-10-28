/**
 * @fileoverview Diagonal energy flows component rendering particle flows along
 * the four diagonal lines connecting opposite cube corners.
 */

// src/components/diagonal-energy-flows.tsx
import * as React from 'react';

import { HALF } from '../data/constants';
import type { BaseVisualizationProps } from '../types/component-props';
import { EnergyFlow } from './energy-flow';

interface DiagonalEnergyFlowsProps extends BaseVisualizationProps {
  speed?: number;
  particleCount?: number;
  isAnimationActive?: boolean;
  isMobile?: boolean;
}

export function DiagonalEnergyFlows({
  visible = true,
  speed = 1.0,
  particleCount = 8,
  opacity = 0.6,
  isAnimationActive = true,
  isMobile = false,
}: DiagonalEnergyFlowsProps): React.JSX.Element {
  // Define the four diagonal flows - from bottom corner to opposite top corner
  const diagonalFlowData = React.useMemo(() => {
    const eastX = HALF;
    const westX = -HALF;
    const topY = HALF;
    const botY = -HALF;
    const southZ = HALF;
    const northZ = -HALF;

    return [
      // Kaph-final: SE bottom to NW top
      {
        name: 'diagonal-kaph-final',
        startPos: [eastX, botY, southZ] as [number, number, number],
        endPos: [westX, topY, northZ] as [number, number, number],
        direction: 'positive' as const,
        color: '#808080', // Gray
      },
      // Nun-final: NE bottom to SW top
      {
        name: 'diagonal-nun-final',
        startPos: [eastX, botY, northZ] as [number, number, number],
        endPos: [westX, topY, southZ] as [number, number, number],
        direction: 'positive' as const,
        color: '#808080', // Gray
      },
      // Peh-final: SW bottom to NE top
      {
        name: 'diagonal-peh-final',
        startPos: [westX, botY, southZ] as [number, number, number],
        endPos: [eastX, topY, northZ] as [number, number, number],
        direction: 'positive' as const,
        color: '#808080', // Gray
      },
      // Tzaddi-final: NW bottom to SE top
      {
        name: 'diagonal-tzaddi-final',
        startPos: [westX, botY, northZ] as [number, number, number],
        endPos: [eastX, topY, southZ] as [number, number, number],
        direction: 'positive' as const,
        color: '#808080', // Gray
      },
    ];
  }, []);

  if (!visible) {
    return <></>;
  }

  return (
    <group>
      {diagonalFlowData.map((data) => (
        <EnergyFlow
          key={data.name}
          startPosition={data.startPos}
          endPosition={data.endPos}
          direction={data.direction}
          color={data.color}
          particleCount={particleCount}
          speed={speed}
          opacity={opacity}
          particleSize={0.018}
          isAnimationActive={isAnimationActive}
          isMobile={isMobile}
        />
      ))}
    </group>
  );
}
