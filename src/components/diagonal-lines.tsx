/**
 * @fileoverview Diagonal lines component rendering lines connecting opposite
 * cube corners through the center (Final letter paths).
 */

// src/components/diagonal-lines.tsx
import { type FC } from 'react';

import { DIAGONAL_LINE_COLOR } from '../data/constants';
import { GeometryRepository } from '../utils/geometry-repository';

interface DiagonalLinesProps {
  opacity?: number;
  color?: string;
}

export const DiagonalLines: FC<DiagonalLinesProps> = ({
  opacity = 0.6,
  color = DIAGONAL_LINE_COLOR,
}) => {
  return (
    <group>
      {GeometryRepository.getAllDiagonals().map((diagonal, index) => {
        const points = new Float32Array([...diagonal.from, ...diagonal.to]);

        return (
          <line key={`diagonal-${diagonal.letter}-${index}`}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[points, 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial color={color} transparent opacity={opacity} />
          </line>
        );
      })}
    </group>
  );
};
