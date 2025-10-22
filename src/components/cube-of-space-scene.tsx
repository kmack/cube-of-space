// src/components/cube-of-space-scene.tsx
import { Grid, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useControls } from 'leva';
import * as React from 'react';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

import { APP_CONFIG } from '../config/app-config';
import { HALF } from '../data/constants';
import { useIsMobile } from '../utils/mobile-detection';
import {
  useIdleDetection,
  usePageVisibility,
} from '../utils/performance-hooks';
import { AxisEnergyFlows } from './axis-energy-flows';
import { AxisLines } from './axis-lines';
import { CameraReset } from './camera-reset';
import { DiagonalEnergyFlows } from './diagonal-energy-flows';
import { DiagonalLabels } from './diagonal-labels';
import { DiagonalLines } from './diagonal-lines';
import { EdgeEnergyFlows } from './edge-energy-flows';
import { EdgeLabels } from './edge-labels';
import { EdgePositionLabels } from './edge-position-labels';
import { FaceLabels } from './face-labels';
import { FacePlanes } from './face-planes';
import { GamepadControls } from './gamepad-controls';
import { MotherLabels } from './mother-labels';
import { WireCube } from './wire-cube';

export function CubeOfSpaceScene(): React.JSX.Element {
  const isMobile = useIsMobile();
  const isPageVisible = usePageVisibility();
  const isUserActive = useIdleDetection(APP_CONFIG.performance.idleTimeoutMs);
  const orbitControlsRef = React.useRef<OrbitControlsImpl>(null);

  // Letters controls
  const [
    {
      showEdges,
      showDoubleLetters,
      showMotherLetters,
      showDiagonals,
      doubleSidedLabels,
      showColorBorders,
    },
    setLetters,
  ] = useControls('Letters', () => ({
    showMotherLetters: {
      value: true,
      label: 'Mother Letters',
    },
    showDoubleLetters: {
      value: true,
      label: 'Double Letters',
    },
    showEdges: {
      value: true,
      label: 'Simple Letters',
    },
    showDiagonals: {
      value: true,
      label: 'Final Letters',
    },
    doubleSidedLabels: {
      value: true,
      label: 'Double-Sided Labels',
    },
    showColorBorders: {
      value: true,
      label: 'Show Color Borders',
    },
  }));

  // Gamepad letter toggle callbacks
  const handleToggleMotherLetters = React.useCallback(() => {
    setLetters({ showMotherLetters: !showMotherLetters });
  }, [showMotherLetters, setLetters]);

  const handleToggleDoubleLetters = React.useCallback(() => {
    setLetters({ showDoubleLetters: !showDoubleLetters });
  }, [showDoubleLetters, setLetters]);

  const handleToggleSingleLetters = React.useCallback(() => {
    setLetters({ showEdges: !showEdges });
  }, [showEdges, setLetters]);

  const handleToggleFinalLetters = React.useCallback(() => {
    setLetters({ showDiagonals: !showDiagonals });
  }, [showDiagonals, setLetters]);

  const handleToggleDoubleSidedLabels = React.useCallback(() => {
    setLetters({ doubleSidedLabels: !doubleSidedLabels });
  }, [doubleSidedLabels, setLetters]);

  // Faces controls
  const [{ showFaces, opaqueFaces }, setFaces] = useControls(
    'Faces',
    () => ({
      showFaces: {
        value: true,
        label: 'Show Faces',
      },
      opaqueFaces: {
        value: false,
        label: 'Opaque Faces',
      },
    }),
    { collapsed: true }
  );

  // Gamepad toggle callbacks
  const handleToggleFaceVisibility = React.useCallback(() => {
    setFaces({ showFaces: !showFaces });
  }, [showFaces, setFaces]);

  const handleToggleFaceOpacity = React.useCallback(() => {
    setFaces({ opaqueFaces: !opaqueFaces });
  }, [opaqueFaces, setFaces]);

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
  const [{ showEnergyFlow, axisFlowDirection }, setEnergyFlow] = useControls(
    'Energy Flow',
    () => ({
      showEnergyFlow: {
        value: true,
        label: 'Show Energy Flow',
      },
      axisFlowDirection: {
        value: 'center-to-faces',
        options: {
          'Center to Faces': 'center-to-faces',
          'Directional Flow': 'directional',
        },
        label: 'Axis Flow Direction',
      },
    }),
    { collapsed: true }
  );

  // Energy Flow Effects controls (nested subfolder)
  const { energySpeed, energyOpacity, energyParticles } = useControls(
    'Energy Flow.Effects',
    {
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
        value: isMobile
          ? APP_CONFIG.rendering.particleCount.mobile
          : APP_CONFIG.rendering.particleCount.desktop,
        min: APP_CONFIG.rendering.particleCount.mobile,
        max: APP_CONFIG.rendering.particleCount.max,
        step: 2,
        label: 'Particles',
      },
    },
    { collapsed: true }
  );

  const handleToggleEnergyFlow = React.useCallback(() => {
    setEnergyFlow({ showEnergyFlow: !showEnergyFlow });
  }, [showEnergyFlow, setEnergyFlow]);

  const handleToggleAxisFlowDirection = React.useCallback(() => {
    setEnergyFlow({
      axisFlowDirection:
        axisFlowDirection === 'center-to-faces'
          ? 'directional'
          : 'center-to-faces',
    });
  }, [axisFlowDirection, setEnergyFlow]);

  // Gamepad controls
  const {
    gamepadRotateSpeed,
    gamepadZoomSpeed,
    gamepadPanSpeed,
    gamepadRotationCurve,
  } = useControls(
    'Gamepad',
    {
      gamepadRotateSpeed: {
        value: APP_CONFIG.controls.gamepad.rotateSpeed,
        min: 1.0,
        max: 20.0,
        step: 0.5,
        label: 'Rotation Speed',
      },
      gamepadZoomSpeed: {
        value: APP_CONFIG.controls.gamepad.zoomSpeed,
        min: 0.5,
        max: 10.0,
        step: 0.5,
        label: 'Zoom Speed',
      },
      gamepadPanSpeed: {
        value: APP_CONFIG.controls.gamepad.panSpeed,
        min: 0.5,
        max: 8.0,
        step: 0.5,
        label: 'Pan Speed',
      },
      gamepadRotationCurve: {
        value: APP_CONFIG.controls.gamepad.rotationCurve,
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
      dpr={
        (isMobile
          ? APP_CONFIG.rendering.dpr.mobile
          : APP_CONFIG.rendering.dpr.desktop) as [number, number]
      }
      camera={{
        position: APP_CONFIG.camera.defaultPosition as [number, number, number],
        fov: APP_CONFIG.camera.fov,
      }}
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
        dampingFactor={APP_CONFIG.controls.orbit.dampingFactor}
        rotateSpeed={APP_CONFIG.controls.orbit.rotateSpeed}
      />
      <GamepadControls
        controlsRef={orbitControlsRef}
        rotateSpeed={gamepadRotateSpeed}
        zoomSpeed={gamepadZoomSpeed}
        panSpeed={gamepadPanSpeed}
        rotationCurve={gamepadRotationCurve}
        onToggleFaceVisibility={handleToggleFaceVisibility}
        onToggleFaceOpacity={handleToggleFaceOpacity}
        onToggleEnergyFlow={handleToggleEnergyFlow}
        onToggleAxisFlowDirection={handleToggleAxisFlowDirection}
        onToggleMotherLetters={handleToggleMotherLetters}
        onToggleDoubleLetters={handleToggleDoubleLetters}
        onToggleSingleLetters={handleToggleSingleLetters}
        onToggleFinalLetters={handleToggleFinalLetters}
        onToggleDoubleSidedLabels={handleToggleDoubleSidedLabels}
      />
      <CameraReset
        controlsRef={orbitControlsRef}
        defaultPosition={
          APP_CONFIG.camera.defaultPosition as [number, number, number]
        }
        defaultTarget={
          APP_CONFIG.camera.defaultTarget as [number, number, number]
        }
        animationDuration={APP_CONFIG.camera.resetAnimationDuration}
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
      <group visible={showDoubleLetters}>
        <FaceLabels
          doubleSided={doubleSidedLabels}
          showColorBorders={showColorBorders}
        />
      </group>
      <group visible={showEdges}>
        <EdgeLabels
          doubleSided={doubleSidedLabels}
          showColorBorders={showColorBorders}
        />
      </group>
      <group visible={showMotherLetters}>
        <MotherLabels
          doubleSided={doubleSidedLabels}
          showColorBorders={showColorBorders}
          isAnimationActive={isUserActive}
          isMobile={isMobile}
        />
      </group>
      <group visible={showDiagonals}>
        <DiagonalLabels
          doubleSided={doubleSidedLabels}
          isAnimationActive={isUserActive}
          isMobile={isMobile}
        />
      </group>

      {/* Energy Flow */}
      <EdgeEnergyFlows
        visible={showEnergyFlow}
        speed={energySpeed}
        particleCount={energyParticles}
        opacity={energyOpacity}
        isAnimationActive={isPageVisible}
        isMobile={isMobile}
      />
      <AxisEnergyFlows
        visible={showEnergyFlow}
        speed={energySpeed}
        particleCount={energyParticles}
        opacity={energyOpacity}
        flowDirection={axisFlowDirection as 'center-to-faces' | 'directional'}
        isAnimationActive={isPageVisible}
        isMobile={isMobile}
      />
      <DiagonalEnergyFlows
        visible={showEnergyFlow}
        speed={energySpeed}
        particleCount={energyParticles}
        opacity={energyOpacity}
        isAnimationActive={isPageVisible}
        isMobile={isMobile}
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
