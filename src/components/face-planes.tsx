// src/components/face-planes.tsx
import * as THREE from 'three';
import * as React from 'react';
import { faces } from '../data/geometry';
import { FACE_COLOR_BY_KEY, SIZE } from '../data/constants';
import { getSpec } from '../data/label-spec';

export function FacePlanes({
  opacity = 0.28,
}: {
  opacity?: number;
}): React.JSX.Element {
  const planeSize = SIZE - 0.01;
  const isOpaque = opacity >= 1.0;
  return (
    <>
      {faces.map((f, i) => {
        const keyNum = String(getSpec(f.letter).keyNumber);
        const faceColor = FACE_COLOR_BY_KEY[keyNum] ?? '#ffffff';
        return (
          <group key={`plane-${i}`} position={f.pos} rotation={f.rotation}>
            <mesh renderOrder={-1}>
              <planeGeometry args={[planeSize, planeSize]} />
              <meshStandardMaterial
                color={faceColor}
                transparent={!isOpaque}
                opacity={opacity}
                depthWrite={isOpaque}
                polygonOffset
                polygonOffsetFactor={1}
                polygonOffsetUnits={1}
                side={THREE.DoubleSide}
                toneMapped={false}
              />
            </mesh>
          </group>
        );
      })}
    </>
  );
}
