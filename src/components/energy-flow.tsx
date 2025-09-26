// src/components/energy-flow.tsx
import * as React from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import type { FlowDirection } from '../data/energy-flow-config';
import { DEVICE_CAPS } from '../utils/device-detection';

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

  // Mobile optimization: reduce update frequency
  const frameSkip = React.useRef(0);
  const updateFrequency = DEVICE_CAPS.isMobile ? 2 : 1; // Update every 2nd frame on mobile

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    // Skip frames on mobile devices to reduce CPU load
    frameSkip.current++;
    if (frameSkip.current % updateFrequency !== 0) return;

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

  // Optimize geometry for mobile devices
  const sphereGeometry = React.useMemo(() => {
    const segments = DEVICE_CAPS.isMobile ? 4 : 6; // Fewer segments on mobile
    return [1, segments, segments] as const;
  }, []);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, particleCount]}>
      <sphereGeometry args={sphereGeometry} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        toneMapped={false}
        depthWrite={false} // Optimize transparency rendering
      />
    </instancedMesh>
  );
}
