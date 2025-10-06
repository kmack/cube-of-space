// src/components/face-planes.tsx
import * as THREE from 'three';
import * as React from 'react';
import { faces } from '../data/geometry';
import { FACE_COLOR_BY_KEY, SIZE } from '../data/constants';
import { getSpec } from '../data/label-spec';

function FacePlanesComponent({
  opacity = 0.28,
}: {
  opacity?: number;
}): React.JSX.Element {
  const planeSize = SIZE - 0.01;
  const isOpaque = opacity >= 1.0;

  // Memoize geometry to avoid recreation on every render
  const planeGeometry = React.useMemo(
    () => new THREE.PlaneGeometry(planeSize, planeSize),
    [planeSize]
  );

  // Memoize face materials to avoid recreation when only opacity changes
  const faceMaterials = React.useMemo(() => {
    return faces.map((f) => {
      const keyNum = String(getSpec(f.letter).keyNumber);
      const faceColor = FACE_COLOR_BY_KEY[keyNum] ?? '#ffffff';
      const material = new THREE.MeshStandardMaterial({
        color: faceColor,
        transparent: !isOpaque,
        depthWrite: isOpaque,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
        side: THREE.DoubleSide,
        toneMapped: false,
      });
      material.opacity = opacity;
      return material;
    });
  }, [isOpaque, opacity]);

  return (
    <>
      {faces.map((f, i) => {
        return (
          <group key={`plane-${i}`} position={f.pos} rotation={f.rotation}>
            <mesh renderOrder={-1} geometry={planeGeometry} material={faceMaterials[i]} />
          </group>
        );
      })}
    </>
  );
}

export const FacePlanes = React.memo(FacePlanesComponent);
