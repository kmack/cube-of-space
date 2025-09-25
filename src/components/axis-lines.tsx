import { type FC } from 'react';
import * as THREE from 'three';
import { HALF } from '../data/constants';

interface AxisLinesProps {
  opacity?: number;
  color?: string;
  lineWidth?: number;
}

export const AxisLines: FC<AxisLinesProps> = ({
  opacity = 0.6,
  color = '#ffffff',
  lineWidth = 2
}) => {
  // Define the three major axes connecting opposite face centers
  const axes = [
    // Vertical axis: Above (Beth) ↔ Below (Gimel)
    {
      start: [0, +HALF, 0] as [number, number, number],
      end: [0, -HALF, 0] as [number, number, number],
      name: 'vertical'
    },
    // East-West axis: East (Daleth) ↔ West (Kaph)
    {
      start: [+HALF, 0, 0] as [number, number, number],
      end: [-HALF, 0, 0] as [number, number, number],
      name: 'east-west'
    },
    // North-South axis: South (Resh) ↔ North (Peh)
    {
      start: [0, 0, +HALF] as [number, number, number],
      end: [0, 0, -HALF] as [number, number, number],
      name: 'north-south'
    }
  ];

  return (
    <group>
      {axes.map((axis, index) => {
        // Create geometry for the line
        const points = [
          new THREE.Vector3(...axis.start),
          new THREE.Vector3(...axis.end)
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        return (
          <primitive
            key={`axis-${axis.name}-${index}`}
            object={new THREE.Line(geometry, new THREE.LineBasicMaterial({
              color: color,
              transparent: true,
              opacity: opacity
            }))}
          />
        );
      })}
    </group>
  );
};