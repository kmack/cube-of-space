import { type FC } from 'react';

import { AXIS_LINE_COLOR, HALF } from '../data/constants';

interface AxisLinesProps {
  opacity?: number;
  color?: string;
  lineWidth?: number;
}

export const AxisLines: FC<AxisLinesProps> = ({
  opacity = 0.6,
  color = AXIS_LINE_COLOR,
}) => {
  // Define the three major axes connecting opposite face centers
  const axes = [
    // Vertical axis: Above (Beth) ↔ Below (Gimel)
    {
      start: [0, +HALF, 0] as [number, number, number],
      end: [0, -HALF, 0] as [number, number, number],
      name: 'vertical',
    },
    // East-West axis: East (Daleth) ↔ West (Kaph)
    {
      start: [+HALF, 0, 0] as [number, number, number],
      end: [-HALF, 0, 0] as [number, number, number],
      name: 'east-west',
    },
    // North-South axis: South (Resh) ↔ North (Peh)
    {
      start: [0, 0, +HALF] as [number, number, number],
      end: [0, 0, -HALF] as [number, number, number],
      name: 'north-south',
    },
  ];

  return (
    <group>
      {axes.map((axis, index) => {
        const points = new Float32Array([...axis.start, ...axis.end]);

        return (
          <line key={`axis-${axis.name}-${index}`}>
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
