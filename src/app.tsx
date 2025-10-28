/**
 * @fileoverview Root application component that orchestrates the 3D scene,
 * controls panel, animated background, and error boundary.
 */

// src/app.tsx
import { Leva } from 'leva';
import * as React from 'react';

import { AnimatedGradientBackground } from './components/animated-gradient-background';
import { CubeOfSpaceScene } from './components/cube-of-space-scene';
import { SceneErrorBoundary } from './components/scene-error-boundary';

export function App(): React.JSX.Element {
  return (
    <>
      <Leva
        collapsed
        theme={{
          sizes: {
            rootWidth: '320px',
            controlWidth: '130px',
          },
        }}
      />
      <AnimatedGradientBackground />
      <SceneErrorBoundary>
        <CubeOfSpaceScene />
      </SceneErrorBoundary>
    </>
  );
}
