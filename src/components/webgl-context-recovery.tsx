/**
 * @fileoverview WebGL context loss recovery — when iOS Safari evicts the GL
 * context under memory pressure the canvas would otherwise silently render
 * blank. This listens for restoration and reloads the page so the user gets
 * a working scene instead of a black void.
 */

// src/components/webgl-context-recovery.tsx
import { useThree } from '@react-three/fiber';
import * as React from 'react';

export function WebGLContextRecovery(): null {
  const gl = useThree((state) => state.gl);

  React.useEffect(() => {
    const dom = gl.domElement;

    const onLost = (event: Event): void => {
      // preventDefault tells the browser we want a 'webglcontextrestored' event
      event.preventDefault();
      console.warn('WebGL context lost');
    };
    const onRestored = (): void => {
      console.warn('WebGL context restored — reloading');
      window.location.reload();
    };

    dom.addEventListener('webglcontextlost', onLost, false);
    dom.addEventListener('webglcontextrestored', onRestored, false);
    return () => {
      dom.removeEventListener('webglcontextlost', onLost);
      dom.removeEventListener('webglcontextrestored', onRestored);
    };
  }, [gl]);

  return null;
}
