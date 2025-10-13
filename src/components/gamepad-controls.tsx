// src/components/gamepad-controls.tsx
import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useGamepad } from '../hooks/use-gamepad';

interface GamepadControlsProps {
  controlsRef: React.RefObject<OrbitControlsImpl>;
  rotateSpeed?: number;
  zoomSpeed?: number;
}

export function GamepadControls({
  controlsRef,
  rotateSpeed = 2.0,
  zoomSpeed = 3.0,
}: GamepadControlsProps): null {
  const { camera } = useThree();
  const gamepad = useGamepad();
  const gamepadRef = useRef(gamepad);
  const lastUpdateRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // Keep gamepad ref up to date
  useEffect(() => {
    gamepadRef.current = gamepad;
  }, [gamepad]);

  useEffect(() => {
    // Wait for both gamepad and controls to be ready
    if (!gamepad.connected) {
      console.log('GamepadControls: Gamepad not connected');
      return;
    }

    if (!controlsRef.current) {
      console.log(
        'GamepadControls: OrbitControls ref not yet available, waiting...'
      );
      return;
    }

    console.log('GamepadControls: Starting update loop with controls');
    const orbitControls = controlsRef.current;

    // Verify controls has the required methods
    if (!orbitControls.getAzimuthalAngle || !orbitControls.getPolarAngle) {
      console.error(
        'GamepadControls: Controls object missing required methods'
      );
      return;
    }

    lastUpdateRef.current = performance.now();

    const updateControls = (timestamp: number): void => {
      const deltaTime = Math.min(
        (timestamp - lastUpdateRef.current) / 1000,
        0.1
      );
      lastUpdateRef.current = timestamp;

      const currentGamepad = gamepadRef.current;

      // Right stick X: Rotate horizontally (azimuth)
      if (Math.abs(currentGamepad.rightStickX) > 0) {
        const azimuthDelta =
          currentGamepad.rightStickX * rotateSpeed * deltaTime;
        orbitControls.setAzimuthalAngle(
          orbitControls.getAzimuthalAngle() - azimuthDelta
        );
      }

      // Right stick Y: Rotate vertically (polar)
      if (Math.abs(currentGamepad.rightStickY) > 0) {
        const polarDelta = currentGamepad.rightStickY * rotateSpeed * deltaTime;
        orbitControls.setPolarAngle(
          Math.max(
            0.1,
            Math.min(Math.PI - 0.1, orbitControls.getPolarAngle() + polarDelta)
          )
        );
      }

      // Triggers: Zoom in/out
      const zoomDelta =
        (currentGamepad.triggers.right - currentGamepad.triggers.left) *
        zoomSpeed *
        deltaTime;
      if (Math.abs(zoomDelta) > 0) {
        const distance = camera.position.distanceTo(orbitControls.target);
        const newDistance = Math.max(1, Math.min(20, distance - zoomDelta));
        camera.position.setLength(newDistance);
      }

      orbitControls.update();
      animationFrameRef.current = requestAnimationFrame(updateControls);
    };

    animationFrameRef.current = requestAnimationFrame(updateControls);

    return () => {
      console.log('GamepadControls: Stopping update loop');
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gamepad.connected, camera, controlsRef, controlsRef.current, rotateSpeed, zoomSpeed]);

  return null;
}
