// src/components/cube-of-space-scene.tsx
import * as React from 'react';
import { Canvas } from '@react-three/fiber';
import { Grid, OrbitControls } from '@react-three/drei';
import { FacePlanes } from './face-planes';
import { WireCube } from './wire-cube';
import { FaceLabels } from './face-labels';
import { EdgeLabels } from './edge-labels';
import { MotherLabels } from './mother-labels';
import { HALF } from '../data/constants';

export function CubeOfSpaceScene(): React.JSX.Element {
  return (
    <Canvas
      style={{ background: '#1a1a1a' }}
      dpr={[1, 2]}
      camera={{ position: [4, 3, 6], fov: 50 }}
      onCreated={({ gl }) => {
        gl.domElement.style.userSelect = 'none'; // prevent selection of items
      }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={0.9} />
      <OrbitControls enableDamping dampingFactor={0.15} rotateSpeed={0.9} />

      {/* Ground grid */}
      <Grid
        position={[0, -HALF - 0.001, 0]}
        sectionSize={3}
        sectionColor={'#666'}
        sectionThickness={1}
        cellSize={1}
        cellColor={'#6f6f6f'}
        cellThickness={0.6}
        infiniteGrid
        fadeDistance={20}
        fadeStrength={1.5}
      />

      {/* Geometry */}
      <FacePlanes opacity={0.8} />
      <WireCube />
      <FaceLabels />
      <EdgeLabels />
      <MotherLabels />
    </Canvas>
  );
}
