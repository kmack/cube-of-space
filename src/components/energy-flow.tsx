// src/components/energy-flow.tsx
import * as React from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export type FlowDirection = 'positive' | 'negative'; // Along or against the tangent vector

export type EnergyFlowProps = {
  startPosition: [number, number, number];
  endPosition: [number, number, number];
  direction: FlowDirection;
  color?: string;
  particleCount?: number;
  speed?: number;
  particleSize?: number;
  opacity?: number;
};

export function EnergyFlow({
  startPosition,
  endPosition,
  direction,
  color = '#00ffff', // Cyan energy
  particleCount = 8,
  speed = 1.0,
  particleSize = 0.02,
  opacity = 0.7,
}: EnergyFlowProps): React.JSX.Element {
  const meshRef = React.useRef<THREE.InstancedMesh>(null);
  const tempObject = React.useRef(new THREE.Object3D());
  const timeRef = React.useRef(0);

  // Calculate edge vector and length
  const edgeVector = React.useMemo(() => {
    const start = new THREE.Vector3(...startPosition);
    const end = new THREE.Vector3(...endPosition);
    return end.sub(start);
  }, [startPosition, endPosition]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    timeRef.current += delta * speed;

    for (let i = 0; i < particleCount; i++) {
      if (!tempObject.current) continue;

      // Calculate animated position along the edge
      const baseProgress = i / particleCount;
      let animatedProgress = baseProgress + ((timeRef.current * 0.5) % 1);

      // Reverse direction if needed
      if (direction === 'negative') {
        animatedProgress = 1 - animatedProgress;
      }

      // Wrap around
      animatedProgress = animatedProgress % 1;

      // Calculate position along edge
      const currentPos = new THREE.Vector3(...startPosition).add(
        edgeVector.clone().multiplyScalar(animatedProgress)
      );

      // Apply position to temp object
      tempObject.current.position.copy(currentPos);
      tempObject.current.scale.setScalar(particleSize);

      // Fade particles based on their position for flowing effect
      const fadeEffect = Math.sin(animatedProgress * Math.PI);
      tempObject.current.scale.multiplyScalar(0.5 + fadeEffect * 0.5);

      tempObject.current.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.current.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, particleCount]}>
      <sphereGeometry args={[1, 8, 6]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        toneMapped={false}
      />
    </instancedMesh>
  );
}
