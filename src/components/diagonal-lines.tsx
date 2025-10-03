// src/components/diagonal-lines.tsx
import { type FC } from 'react';
import * as THREE from 'three';
import { diagonals } from '../data/geometry';

interface DiagonalLinesProps {
  opacity?: number;
  color?: string;
}

export const DiagonalLines: FC<DiagonalLinesProps> = ({
  opacity = 0.6,
  color = '#ff88cc',
}) => {
  return (
    <group>
      {diagonals.map((diagonal, index) => {
        // Create geometry for the line
        const points = [
          new THREE.Vector3(...diagonal.from),
          new THREE.Vector3(...diagonal.to),
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        return (
          <primitive
            key={`diagonal-${diagonal.letter}-${index}`}
            object={
              new THREE.Line(
                geometry,
                new THREE.LineBasicMaterial({
                  color: color,
                  transparent: true,
                  opacity: opacity,
                })
              )
            }
          />
        );
      })}
    </group>
  );
};
