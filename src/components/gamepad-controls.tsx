// src/components/gamepad-controls.tsx
import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Vector3 } from 'three';
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
  onToggleFaceVisibility?: () => void;
  onToggleFaceOpacity?: () => void;
  onToggleEnergyFlow?: () => void;
  onToggleAxisFlowDirection?: () => void;
  onToggleMotherLetters?: () => void;
  onToggleDoubleLetters?: () => void;
  onToggleSingleLetters?: () => void;
  onToggleFinalLetters?: () => void;
  onToggleDoubleSidedLabels?: () => void;
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
  onToggleEnergyFlow,
  onToggleAxisFlowDirection,
  onToggleMotherLetters,
  onToggleDoubleLetters,
  onToggleSingleLetters,
  onToggleFinalLetters,
  onToggleDoubleSidedLabels,
}: GamepadControlsProps): null {
  const { camera } = useThree();
  const gamepad = useGamepad();
  const gamepadRef = useRef(gamepad);
  const lastUpdateRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // Map-based button state tracking for cleaner debouncing
  const buttonStates = useRef<Map<string, boolean>>(new Map());

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

      // Helper function for button debouncing with Map
      const handleButton = (
        key: string,
        isPressed: boolean,
        callback?: () => void
      ): void => {
        const wasPressed = buttonStates.current.get(key) ?? false;
        if (isPressed && !wasPressed) {
          callback?.();
        }
        buttonStates.current.set(key, isPressed);
      };

      // A button: Toggle energy flow visibility
      handleButton('a', currentGamepad.buttons.a, onToggleEnergyFlow);

      // B button: Toggle double-sided labels
      handleButton('b', currentGamepad.buttons.b, onToggleDoubleSidedLabels);

      // Y button: Toggle axis flow direction
      handleButton('y', currentGamepad.buttons.y, onToggleAxisFlowDirection);

      // D-Pad Up: Toggle Mother Letters
      handleButton(
        'dpadUp',
        currentGamepad.buttons.dpadUp,
        onToggleMotherLetters
      );

      // D-Pad Right: Toggle Double Letters
      handleButton(
        'dpadRight',
        currentGamepad.buttons.dpadRight,
        onToggleDoubleLetters
      );

      // D-Pad Down: Toggle Single Letters
      handleButton(
        'dpadDown',
        currentGamepad.buttons.dpadDown,
        onToggleSingleLetters
      );

      // D-Pad Left: Toggle Final Letters
      handleButton(
        'dpadLeft',
        currentGamepad.buttons.dpadLeft,
        onToggleFinalLetters
      );

      // Left bumper (LB): Toggle face visibility
      handleButton(
        'leftBumper',
        currentGamepad.buttons.leftBumper,
        onToggleFaceVisibility
      );

      // Right bumper (RB): Toggle face opacity
      handleButton(
        'rightBumper',
        currentGamepad.buttons.rightBumper,
        onToggleFaceOpacity
      );

      // Left stick press: Reset pan (target position) to origin
      handleButton(
        'leftStickPress',
        currentGamepad.buttons.leftStickPress,
        () => {
          orbitControls.target.set(...defaultTarget);
          orbitControls.update();
        }
      );

      // Right stick press: Reset view to defaults
      handleButton(
        'rightStickPress',
        currentGamepad.buttons.rightStickPress,
        () => {
          camera.position.set(...defaultCameraPosition);
          orbitControls.target.set(...defaultTarget);
          camera.updateMatrixWorld();
          orbitControls.update();
        }
      );

      // Left stick: Pan in screen space (like right-mouse-button drag)
      if (
        Math.abs(currentGamepad.leftStickX) > 0 ||
        Math.abs(currentGamepad.leftStickY) > 0
      ) {
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
      const triggerDelta =
        currentGamepad.triggers.right - currentGamepad.triggers.left;
      if (Math.abs(triggerDelta) > 0.01) {
        hasGamepadInput = true;
        const zoomDelta = triggerDelta * zoomSpeed * deltaTime;
        const distance = camera.position.distanceTo(orbitControls.target);
        const newDistance = Math.max(1, Math.min(20, distance - zoomDelta));

        // Calculate direction from target to camera, then scale to new distance
        const direction = camera.position
          .clone()
          .sub(orbitControls.target)
          .normalize();
        camera.position
          .copy(orbitControls.target)
          .add(direction.multiplyScalar(newDistance));
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
    onToggleEnergyFlow,
    onToggleAxisFlowDirection,
    onToggleMotherLetters,
    onToggleDoubleLetters,
    onToggleSingleLetters,
    onToggleFinalLetters,
    onToggleDoubleSidedLabels,
  ]);

  return null;
}
