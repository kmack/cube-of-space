// src/app.tsx
import * as React from 'react';
import { Leva } from 'leva';
import { CubeOfSpaceScene } from './components/cube-of-space-scene';
import { AnimatedGradientBackground } from './components/animated-gradient-background';

export function App(): React.JSX.Element {
  return (
    <>
      <Leva collapsed />
      <AnimatedGradientBackground />
      <CubeOfSpaceScene />
    </>
  );
}
