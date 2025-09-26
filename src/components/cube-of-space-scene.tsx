// src/components/cube-of-space-scene.tsx
import * as React from 'react';

import { Canvas } from '@react-three/fiber';
import { Grid, OrbitControls } from '@react-three/drei';
import { useControls } from 'leva';

import { FacePlanes } from './face-planes';
import { WireCube } from './wire-cube';
import { AxisLines } from './axis-lines';
import { FaceLabels } from './face-labels';
import { EdgeLabels } from './edge-labels';
import { MotherLabels } from './mother-labels';
import { EdgeEnergyFlows } from './edge-energy-flows';
import { EdgePositionLabels } from './edge-position-labels';

import { HALF } from '../data/constants';
import { DEVICE_CAPS } from '../utils/device-detection';
import { useAdaptiveQuality, enablePerformanceDebugging } from '../hooks/use-mobile-performance';

export function CubeOfSpaceScene(): React.JSX.Element {
  // Adaptive performance monitoring
  const { getParticleCount, getAnimationSpeed, shouldShowFeature } = useAdaptiveQuality();

  // Enable debug mode in development
  React.useEffect(() => {
    if (import.meta.env.DEV) {
      enablePerformanceDebugging();
    }
  }, []);

  // Device-aware defaults
  const defaultParticles = DEVICE_CAPS.maxParticles;
  const defaultEnergyFlow = !DEVICE_CAPS.shouldReduceAnimations;

  // UI Controls with mobile-optimized defaults
  const {
    showGrid,
    showAxesHelper,
    showAxisLines,
    showEnergyFlow,
    energySpeed,
    energyOpacity,
    energyParticles,
    showEdgePositions
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
    showEnergyFlow: {
      value: defaultEnergyFlow,
      label: 'Show Energy Flow',
    },
    energySpeed: {
      value: DEVICE_CAPS.shouldReduceAnimations ? 0.5 : 1.0,
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
      value: defaultParticles,
      min: 2,
      max: DEVICE_CAPS.isMobile ? 8 : 16,
      step: 2,
      label: 'Energy Particles',
    },
    showEdgePositions: {
      value: !DEVICE_CAPS.isLowEnd,
      label: 'Show Edge Positions',
    },
  });

  // Calculate effective settings based on device capabilities and performance
  const effectiveParticles = getParticleCount(energyParticles);
  const effectiveSpeed = getAnimationSpeed(energySpeed);
  const effectiveEnergyFlow = showEnergyFlow && shouldShowFeature('particles');

  return (
    <Canvas
      style={{ background: 'transparent' }}
      dpr={[1, DEVICE_CAPS.maxDPR]}
      camera={{ position: [4, 3, 6], fov: 50 }}
      performance={{ min: 0.5 }} // Allow frame rate reduction under stress
      frameloop={DEVICE_CAPS.shouldReduceAnimations ? 'demand' : 'always'} // Reduce frame loop on low-end devices
      onCreated={({ gl, camera }) => {
        gl.domElement.style.userSelect = 'none'; // prevent selection of items
        gl.setClearColor(0x000000, 0); // transparent clear color

        // Mobile-specific optimizations
        if (DEVICE_CAPS.isMobile) {
          gl.setPixelRatio(Math.min(window.devicePixelRatio, DEVICE_CAPS.maxDPR));

          // Reduce shadow map size on mobile
          gl.shadowMap.enabled = false;

          // Optimize camera for mobile viewing
          if ('fov' in camera) {
            camera.fov = 60; // Wider FOV for mobile
            camera.updateProjectionMatrix();
          }
        }

        // iOS-specific optimizations
        if (DEVICE_CAPS.isIOS) {
          // Prevent iOS from optimizing away the canvas
          gl.domElement.style.willChange = 'transform';
          gl.domElement.style.backfaceVisibility = 'hidden';
        }
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
      {showAxisLines && <AxisLines opacity={0.7} color="#88ccff" />}
      <FaceLabels />
      <EdgeLabels />
      <MotherLabels />

      {/* Energy Flow - with performance-aware settings */}
      <EdgeEnergyFlows
        visible={effectiveEnergyFlow}
        speed={effectiveSpeed}
        particleCount={effectiveParticles}
        opacity={energyOpacity}
      />

      {/* Edge Position Labels - conditional on device capability */}
      {shouldShowFeature('labels') && (
        <EdgePositionLabels
          visible={showEdgePositions}
          fontSize={DEVICE_CAPS.isMobile ? 0.08 : 0.06} // Larger font on mobile
          color="#999999"
          offset={0.35}
        />
      )}
    </Canvas>
  );
}
