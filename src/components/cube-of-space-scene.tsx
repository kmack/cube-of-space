// src/components/cube-of-space-scene.tsx
import * as React from 'react';

import { Canvas } from '@react-three/fiber';
import { Grid, OrbitControls } from '@react-three/drei';
import { useControls } from 'leva';

import { FacePlanes } from './face-planes';
import { WireCube } from './wire-cube';
import { AxisLines } from './axis-lines';
import { DiagonalLines } from './diagonal-lines';
import { FaceLabels } from './face-labels';
import { EdgeLabels } from './edge-labels';
import { MotherLabels } from './mother-labels';
import { DiagonalLabels } from './diagonal-labels';
import { EdgeEnergyFlows } from './edge-energy-flows';
import { EdgePositionLabels } from './edge-position-labels';

import { HALF } from '../data/constants';

export function CubeOfSpaceScene(): React.JSX.Element {
  // UI Controls
  const {
    showGrid,
    showAxesHelper,
    showAxisLines,
    showDiagonalLines,
    showDiagonalLabels,
    showEnergyFlow,
    energySpeed,
    energyOpacity,
    energyParticles,
    showEdgePositions,
    useMemoryOptimization,
  } = useControls({
    showGrid: {
      value: false,
      label: 'Show Ground Grid',
    },
    showAxesHelper: {
      value: false,
      label: 'Show Axes Helper',
    },
    showAxisLines: {
      value: true,
      label: 'Show Axis Lines',
    },
    showDiagonalLines: {
      value: true,
      label: 'Show Diagonal Lines',
    },
    showDiagonalLabels: {
      value: false,
      label: 'Show Diagonal Labels',
    },
    showEnergyFlow: {
      value: true,
      label: 'Show Energy Flow',
    },
    energySpeed: {
      value: 1.0,
      min: 0.1,
      max: 3.0,
      step: 0.1,
      label: 'Energy Speed',
    },
    energyOpacity: {
      value: 0.6,
      min: 0.1,
      max: 1.0,
      step: 0.1,
      label: 'Energy Opacity',
    },
    energyParticles: {
      value: 8,
      min: 4,
      max: 16,
      step: 2,
      label: 'Energy Particles',
    },
    showEdgePositions: {
      value: true,
      label: 'Show Edge Positions',
    },
    // Memory optimization controls
    useMemoryOptimization: {
      value: true,
      label: 'Memory Optimization',
    },
  });

  return (
    <Canvas
      style={{ background: 'transparent' }}
      dpr={[1, 2]}
      camera={{ position: [4, 3, 6], fov: 50 }}
      onCreated={({ gl }) => {
        gl.domElement.style.userSelect = 'none'; // prevent selection of items
        gl.setClearColor(0x000000, 0); // transparent clear color
      }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={0.9} />
      <OrbitControls enableDamping dampingFactor={0.15} rotateSpeed={0.9} />

      {/* Ground grid */}
      {showGrid && (
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
      )}
      {showAxesHelper && <axesHelper args={[5]} />}

      {/* Geometry */}
      <FacePlanes opacity={0.8} />
      <WireCube />
      {showAxisLines && <AxisLines opacity={0.7} />}
      {showDiagonalLines && <DiagonalLines opacity={0.7} />}
      <FaceLabels useMemoryOptimization={useMemoryOptimization} />
      <EdgeLabels useMemoryOptimization={useMemoryOptimization} />
      <MotherLabels useMemoryOptimization={useMemoryOptimization} />
      {showDiagonalLabels && (
        <DiagonalLabels useMemoryOptimization={useMemoryOptimization} />
      )}

      {/* Energy Flow */}
      <EdgeEnergyFlows
        visible={showEnergyFlow}
        speed={energySpeed}
        particleCount={energyParticles}
        opacity={energyOpacity}
      />

      {/* Edge Position Labels */}
      <EdgePositionLabels
        visible={showEdgePositions}
        fontSize={0.06}
        color="#999999"
        offset={0.15}
      />
    </Canvas>
  );
}
