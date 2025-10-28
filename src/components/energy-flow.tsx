// src/components/energy-flow.tsx
import { useFrame } from '@react-three/fiber';
import * as React from 'react';
import * as THREE from 'three';

import type { FlowDirection } from '../data/energy-flow-config';
import { useFrameThrottle } from '../utils/performance-hooks';

export type EnergyFlowProps = {
  startPosition: [number, number, number];
  endPosition: [number, number, number];
  direction: FlowDirection;
  color?: string;
  particleCount?: number;
  speed?: number;
  particleSize?: number;
  opacity?: number;
  isAnimationActive?: boolean;
  isMobile?: boolean;
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
  isAnimationActive = true,
  isMobile = false,
}: EnergyFlowProps): React.JSX.Element {
  const meshRef = React.useRef<THREE.InstancedMesh>(null);
  const tempObject = React.useRef(new THREE.Object3D());
  const timeRef = React.useRef(0);
  const shouldProcessFrame = useFrameThrottle(isMobile);

  // Calculate edge vector and length
  const edgeVector = React.useMemo(() => {
    const start = new THREE.Vector3(...startPosition);
    const end = new THREE.Vector3(...endPosition);
    return end.sub(start);
  }, [startPosition, endPosition]);

  // Memoize geometry to avoid recreation
  const sphereGeometry = React.useMemo(
    () => new THREE.SphereGeometry(1, 8, 6),
    []
  );

  // Memoize material to avoid recreation when props change
  const particleMaterial = React.useMemo(() => {
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      toneMapped: false,
    });
    material.opacity = opacity;
    return material;
  }, [color, opacity]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    // Pause animations when not active (idle or tab hidden)
    if (!isAnimationActive) return;

    // Throttle to 30fps on mobile (skip every other frame)
    if (!shouldProcessFrame()) return;

    timeRef.current += delta * speed;

    for (let i = 0; i < particleCount; i++) {
      if (!tempObject.current) continue;

      // Calculate animated position along the edge
      const baseProgress = i / particleCount;
      const timeOffset = (timeRef.current * 0.5) % 1;

      let animatedProgress: number;
      if (direction === 'negative') {
        // For negative direction, flow from 1 to 0
        animatedProgress = (1 - baseProgress - timeOffset + 2) % 1;
      } else {
        // For positive direction, flow from 0 to 1
        animatedProgress = (baseProgress + timeOffset) % 1;
      }

      // Ensure progress stays within [0, 1] bounds
      animatedProgress = Math.max(0, Math.min(1, animatedProgress));

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
    <instancedMesh
      ref={meshRef}
      args={[sphereGeometry, particleMaterial, particleCount]}
    />
  );
}
