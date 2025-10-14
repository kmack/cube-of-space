// src/components/gamepad-controls.tsx
import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { Vector3 } from 'three';
import { useGamepad } from '../hooks/use-gamepad';

interface GamepadControlsProps {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  rotateSpeed?: number;
  zoomSpeed?: number;
  panSpeed?: number;
  rotationCurve?: number; // Exponent for rotation curve (1.0 = linear, >1.0 = exponential)
  defaultCameraPosition?: [number, number, number];
  defaultTarget?: [number, number, number];
  onToggleFaceVisibility?: () => void;
  onToggleFaceOpacity?: () => void;
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
  onToggleFaceVisibility,
  onToggleFaceOpacity,
}: GamepadControlsProps): null {
  const { camera } = useThree();
  const gamepad = useGamepad();
  const gamepadRef = useRef(gamepad);
  const lastUpdateRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastLeftBumperRef = useRef<boolean>(false);
  const lastRightBumperRef = useRef<boolean>(false);
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

      // Left bumper (LB): Toggle face visibility (with debouncing)
      if (currentGamepad.buttons.leftBumper && !lastLeftBumperRef.current) {
        onToggleFaceVisibility?.();
      }
      lastLeftBumperRef.current = currentGamepad.buttons.leftBumper;

      // Right bumper (RB): Toggle face opacity (with debouncing)
      if (currentGamepad.buttons.rightBumper && !lastRightBumperRef.current) {
        onToggleFaceOpacity?.();
      }
      lastRightBumperRef.current = currentGamepad.buttons.rightBumper;

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

      // Left stick: Pan in screen space (like right-mouse-button drag)
      if (Math.abs(currentGamepad.leftStickX) > 0 || Math.abs(currentGamepad.leftStickY) > 0) {
        hasGamepadInput = true;

        // Get camera's right vector (for horizontal panning)
        const cameraRight = new Vector3();
        camera.getWorldDirection(cameraRight);
        cameraRight.cross(camera.up).normalize();

        // Get camera's up vector (for vertical panning)
        const cameraUp = new Vector3();
        camera.getWorldDirection(cameraUp);
        cameraUp.cross(cameraRight).normalize();

        // Apply pan movement
        const panX = currentGamepad.leftStickX * panSpeed * deltaTime;
        const panY = currentGamepad.leftStickY * panSpeed * deltaTime;

        orbitControls.target.addScaledVector(cameraRight, panX);
        orbitControls.target.addScaledVector(cameraUp, panY);

        // Move camera along with target to maintain relative position
        camera.position.addScaledVector(cameraRight, panX);
        camera.position.addScaledVector(cameraUp, panY);
      }

      // Triggers: Zoom in/out
      const triggerDelta = currentGamepad.triggers.right - currentGamepad.triggers.left;
      if (Math.abs(triggerDelta) > 0.01) {
        hasGamepadInput = true;
        const zoomDelta = triggerDelta * zoomSpeed * deltaTime;
        const distance = camera.position.distanceTo(orbitControls.target);
        const newDistance = Math.max(1, Math.min(20, distance - zoomDelta));

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
    onToggleFaceVisibility,
    onToggleFaceOpacity,
  ]);

  return null;
}
