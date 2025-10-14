// src/app.tsx
import { Leva } from 'leva';
import * as React from 'react';

import { AnimatedGradientBackground } from './components/animated-gradient-background';
import { CubeOfSpaceScene } from './components/cube-of-space-scene';

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
      <CubeOfSpaceScene />
    </>
  );
}
