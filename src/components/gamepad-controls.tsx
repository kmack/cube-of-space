// src/components/gamepad-controls.tsx
import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useGamepad } from '../hooks/use-gamepad';

interface GamepadControlsProps {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  rotateSpeed?: number;
  zoomSpeed?: number;
  panSpeed?: number;
  rotationCurve?: number; // Exponent for rotation curve (1.0 = linear, >1.0 = exponential)
  defaultCameraPosition?: [number, number, number];
  defaultTarget?: [number, number, number];
}

/**
 * Apply a power curve to input for more responsive controls
 * Small inputs remain small for precision, large inputs scale faster
 */
function applyCurve(value: number, exponent: number): number {
  const sign = Math.sign(value);
  const magnitude = Math.abs(value);
  return sign * Math.pow(magnitude, exponent);
}

export function GamepadControls({
  controlsRef,
  rotateSpeed = 4.0,
  zoomSpeed = 3.0,
  panSpeed = 2.0,
  rotationCurve = 2.0,
  defaultCameraPosition = [4, 3, 6],
  defaultTarget = [0, 0, 0],
}: GamepadControlsProps): null {
  const { camera } = useThree();
  const gamepad = useGamepad();
  const gamepadRef = useRef(gamepad);
  const lastUpdateRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastLeftStickPressRef = useRef<boolean>(false);
  const lastRightStickPressRef = useRef<boolean>(false);

  // Keep gamepad ref up to date
  useEffect(() => {
    gamepadRef.current = gamepad;
  }, [gamepad]);

  useEffect(() => {
    // Wait for both gamepad and controls to be ready
    if (!gamepad.connected) {
      return;
    }

    if (!controlsRef.current) {
      return;
    }

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
      let hasGamepadInput = false;

      // Left stick press: Reset pan (target position) to origin (with debouncing)
      if (currentGamepad.buttons.leftStickPress && !lastLeftStickPressRef.current) {
        // Button just pressed (rising edge)
        orbitControls.target.set(...defaultTarget);
        orbitControls.update();
      }
      lastLeftStickPressRef.current = currentGamepad.buttons.leftStickPress;

      // Right stick press: Reset view to defaults (with debouncing)
      if (currentGamepad.buttons.rightStickPress && !lastRightStickPressRef.current) {
        // Button just pressed (rising edge)
        camera.position.set(...defaultCameraPosition);
        orbitControls.target.set(...defaultTarget);
        camera.updateMatrixWorld();
        orbitControls.update();
      }
      lastRightStickPressRef.current = currentGamepad.buttons.rightStickPress;

      // Left stick X: Pan horizontally
      if (Math.abs(currentGamepad.leftStickX) > 0) {
        hasGamepadInput = true;
        const panX = currentGamepad.leftStickX * panSpeed * deltaTime;
        orbitControls.target.x += panX;
      }

      // Left stick Y: Zoom in/out
      if (Math.abs(currentGamepad.leftStickY) > 0) {
        hasGamepadInput = true;
        const zoomDelta = currentGamepad.leftStickY * zoomSpeed * deltaTime;
        const distance = camera.position.distanceTo(orbitControls.target);
        const newDistance = Math.max(1, Math.min(20, distance + zoomDelta));

        // Calculate direction from target to camera, then scale to new distance
        const direction = camera.position.clone().sub(orbitControls.target).normalize();
        camera.position.copy(orbitControls.target).add(direction.multiplyScalar(newDistance));
      }

      // Right stick X: Rotate horizontally (azimuth)
      if (Math.abs(currentGamepad.rightStickX) > 0) {
        hasGamepadInput = true;
        const curvedInput = applyCurve(
          currentGamepad.rightStickX,
          rotationCurve
        );
        const azimuthDelta = curvedInput * rotateSpeed * deltaTime;
        orbitControls.setAzimuthalAngle(
          orbitControls.getAzimuthalAngle() - azimuthDelta
        );
      }

      // Right stick Y: Rotate vertically (polar) - inverted for natural camera movement
      if (Math.abs(currentGamepad.rightStickY) > 0) {
        hasGamepadInput = true;
        const curvedInput = applyCurve(
          currentGamepad.rightStickY,
          rotationCurve
        );
        const polarDelta = curvedInput * rotateSpeed * deltaTime;
        orbitControls.setPolarAngle(
          Math.max(
            0.1,
            Math.min(Math.PI - 0.1, orbitControls.getPolarAngle() - polarDelta)
          )
        );
      }

      // If we have gamepad input, temporarily disable damping to prevent momentum buildup
      if (hasGamepadInput && orbitControls.enableDamping) {
        const wasDampingEnabled = orbitControls.enableDamping;
        orbitControls.enableDamping = false;
        orbitControls.update();
        orbitControls.enableDamping = wasDampingEnabled;
      } else {
        orbitControls.update();
      }

      animationFrameRef.current = requestAnimationFrame(updateControls);
    };

    animationFrameRef.current = requestAnimationFrame(updateControls);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    gamepad.connected,
    camera,
    controlsRef,
    rotateSpeed,
    zoomSpeed,
    panSpeed,
    rotationCurve,
    defaultCameraPosition,
    defaultTarget,
  ]);

  return null;
}
