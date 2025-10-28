/**
 * @fileoverview Wireframe cube component rendering the basic geometric structure
 * using Line segments from react-three/drei.
 */

// src/components/wire-cube.tsx
import { Line } from '@react-three/drei';
import * as React from 'react';

import { SIZE } from '../data/constants';
import type { Vec3 } from '../utils/types';

export function WireCube({
  size = SIZE,
  color = '#444',
}: {
  size?: number;
  color?: string;
}): React.JSX.Element {
  const h = size / 2;
  const corners: Vec3[] = [
    [-h, -h, -h],
    [h, -h, -h],
    [h, -h, h],
    [-h, -h, h],
    [-h, h, -h],
    [h, h, -h],
    [h, h, h],
    [-h, h, h],
  ];
  const segments: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ];
  return (
    <>
      {segments.map((pair, i) => (
        <Line
          key={i}
          points={[corners[pair[0]], corners[pair[1]]]}
          color={color}
          lineWidth={1.5}
        />
      ))}
    </>
  );
}
