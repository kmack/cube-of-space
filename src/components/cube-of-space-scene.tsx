// src/components/cube-of-space-scene.tsx
import * as React from 'react';

import { Canvas } from '@react-three/fiber';
import { Grid, OrbitControls } from '@react-three/drei';
import { useControls } from 'leva';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

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
import { GamepadControls } from './gamepad-controls';

import { HALF } from '../data/constants';

export function CubeOfSpaceScene(): React.JSX.Element {
  const orbitControlsRef = React.useRef<OrbitControlsImpl>(null);

  // Letters controls
  const { showEdges, showDoubleLetters, showMotherLetters, showDiagonals } =
    useControls('Letters', {
      showEdges: {
        value: true,
        label: 'Single Letters',
      },
      showDoubleLetters: {
        value: true,
        label: 'Double Letters',
      },
      showMotherLetters: {
        value: true,
        label: 'Mother Letters',
      },
      showDiagonals: {
        value: true,
        label: 'Final Letters',
      },
    });

  // Faces controls
  const { showFaces, opaqueFaces } = useControls(
    'Faces',
    {
      showFaces: {
        value: true,
        label: 'Show Faces',
      },
      opaqueFaces: {
        value: false,
        label: 'Opaque Faces',
      },
    },
    { collapsed: true }
  );

  // Axes controls
  const { showAxisLines, showDiagonalLines, showEdgePositions } = useControls(
    'Axes',
    {
      showAxisLines: {
        value: true,
        label: 'Show Axis Lines',
      },
      showDiagonalLines: {
        value: true,
        label: 'Show Diagonal Lines',
      },
      showEdgePositions: {
        value: true,
        label: 'Show Edge Positions',
      },
    },
    { collapsed: true }
  );

  // Energy Flow controls
  const { showEnergyFlow, energySpeed, energyOpacity, energyParticles } =
    useControls(
      'Energy Flow',
      {
        showEnergyFlow: {
          value: true,
          label: 'Show Energy Flow',
        },
        energySpeed: {
          value: 1.0,
          min: 0.1,
          max: 3.0,
          step: 0.1,
          label: 'Speed',
        },
        energyOpacity: {
          value: 0.6,
          min: 0.1,
          max: 1.0,
          step: 0.1,
          label: 'Opacity',
        },
        energyParticles: {
          value: 8,
          min: 4,
          max: 16,
          step: 2,
          label: 'Particles',
        },
      },
      { collapsed: true }
    );

  // Gamepad controls
  const { gamepadRotateSpeed, gamepadRotationCurve } = useControls(
    'Gamepad',
    {
      gamepadRotateSpeed: {
        value: 10.0,
        min: 1.0,
        max: 20.0,
        step: 0.5,
        label: 'Rotation Speed',
      },
      gamepadRotationCurve: {
        value: 2.5,
        min: 1.0,
        max: 4.0,
        step: 0.1,
        label: 'Rotation Curve',
      },
    },
    { collapsed: true }
  );

  // Debug controls
  const { showGrid, showAxesHelper } = useControls(
    'Debug',
    {
      showGrid: {
        value: false,
        label: 'Show Ground Grid',
      },
      showAxesHelper: {
        value: false,
        label: 'Show Axes Helper',
      },
    },
    { collapsed: true }
  );

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
      <OrbitControls
        ref={orbitControlsRef}
        enableDamping
        dampingFactor={0.15}
        rotateSpeed={0.9}
      />
      <GamepadControls
        controlsRef={orbitControlsRef}
        rotateSpeed={gamepadRotateSpeed}
        zoomSpeed={3.0}
        rotationCurve={gamepadRotationCurve}
      />

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
      {showFaces && (
        <FacePlanes
          key={opaqueFaces ? 'opaque' : 'transparent'}
          opacity={opaqueFaces ? 1.0 : 0.8}
        />
      )}
      <WireCube />
      {showAxisLines && <AxisLines opacity={0.7} />}
      {showDiagonalLines && <DiagonalLines opacity={0.7} />}

      {/* Keep label components mounted, toggle visibility to prevent texture churn */}
      <group visible={showFaces && showDoubleLetters}>
        <FaceLabels />
      </group>
      <group visible={showEdges}>
        <EdgeLabels />
      </group>
      <group visible={showMotherLetters}>
        <MotherLabels />
      </group>
      <group visible={showDiagonals}>
        <DiagonalLabels />
      </group>

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
