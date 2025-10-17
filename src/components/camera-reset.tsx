// src/components/camera-reset.tsx
import { useThree } from '@react-three/fiber';
import * as React from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

interface CameraResetProps {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  defaultPosition?: [number, number, number];
  defaultTarget?: [number, number, number];
  animationDuration?: number;
}

export function CameraReset({
  controlsRef,
  defaultPosition = [4, 3, 6],
  defaultTarget = [0, 0, 0],
  animationDuration = 1000,
}: CameraResetProps): null {
  const { camera, gl } = useThree();
  const lastClickTimeRef = React.useRef<number>(0);
  const animationFrameRef = React.useRef<number | null>(null);

  const resetCamera = React.useCallback(() => {
    if (!controlsRef.current) return;

    const controls = controlsRef.current;
    const startPosition = camera.position.clone();
    const startTarget = controls.target.clone();
    const endPosition = new THREE.Vector3(...defaultPosition);
    const endTarget = new THREE.Vector3(...defaultTarget);
    const startTime = performance.now();

    // Cancel any ongoing animation
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const animate = (currentTime: number): void => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);

      // Ease out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);

      // Interpolate camera position
      camera.position.lerpVectors(startPosition, endPosition, eased);

      // Interpolate controls target
      controls.target.lerpVectors(startTarget, endTarget, eased);
      controls.update();

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        animationFrameRef.current = null;
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [camera, controlsRef, defaultPosition, defaultTarget, animationDuration]);

  const handleDoubleClick = React.useCallback(
    (event: MouseEvent | TouchEvent) => {
      const currentTime = performance.now();
      const timeSinceLastClick = currentTime - lastClickTimeRef.current;

      // For touch events, handle double-tap (within 300ms)
      if (event.type === 'touchstart') {
        const touchEvent = event as TouchEvent;
        // Only respond to single-finger taps
        if (touchEvent.touches.length === 1) {
          if (timeSinceLastClick < 300 && timeSinceLastClick > 0) {
            event.preventDefault();
            resetCamera();
            lastClickTimeRef.current = 0; // Reset to prevent triple-tap
          } else {
            lastClickTimeRef.current = currentTime;
          }
        }
      } else if (event.type === 'dblclick') {
        // Standard double-click for desktop
        event.preventDefault();
        resetCamera();
      }
    },
    [resetCamera]
  );

  React.useEffect(() => {
    const canvas = gl.domElement;

    // Add double-click listener for desktop
    canvas.addEventListener('dblclick', handleDoubleClick);

    // Add touch listener for mobile double-tap
    canvas.addEventListener('touchstart', handleDoubleClick, {
      passive: false,
    });

    return () => {
      canvas.removeEventListener('dblclick', handleDoubleClick);
      canvas.removeEventListener('touchstart', handleDoubleClick);

      // Clean up animation frame on unmount
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gl.domElement, handleDoubleClick]);

  return null;
}
