/**
 * @fileoverview React hook for gamepad input handling with dead zones and
 * button state tracking for camera control integration.
 */

// src/hooks/use-gamepad.ts
import { useEffect, useRef, useState } from 'react';

import { APP_CONFIG } from '../config/app-config';

export interface GamepadState {
  connected: boolean;
  leftStickX: number;
  leftStickY: number;
  rightStickX: number;
  rightStickY: number;
  triggers: {
    left: number;
    right: number;
  };
  buttons: {
    a: boolean;
    b: boolean;
    x: boolean;
    y: boolean;
    dpadUp: boolean;
    dpadDown: boolean;
    dpadLeft: boolean;
    dpadRight: boolean;
    leftBumper: boolean;
    rightBumper: boolean;
    leftStickPress: boolean;
    rightStickPress: boolean;
  };
}

const DEADZONE = APP_CONFIG.controls.gamepad.deadzone; // Ignore small stick movements

function applyDeadzone(value: number, deadzone: number): number {
  if (Math.abs(value) < deadzone) return 0;
  // Scale the value so deadzone maps to 0 and 1.0 stays at 1.0
  const sign = Math.sign(value);
  const magnitude = Math.abs(value);
  return sign * ((magnitude - deadzone) / (1 - deadzone));
}

export function useGamepad(): GamepadState {
  const [state, setState] = useState<GamepadState>({
    connected: false,
    leftStickX: 0,
    leftStickY: 0,
    rightStickX: 0,
    rightStickY: 0,
    triggers: { left: 0, right: 0 },
    buttons: {
      a: false,
      b: false,
      x: false,
      y: false,
      dpadUp: false,
      dpadDown: false,
      dpadLeft: false,
      dpadRight: false,
      leftBumper: false,
      rightBumper: false,
      leftStickPress: false,
      rightStickPress: false,
    },
  });

  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    let gamepadIndex: number | null = null;

    const handleGamepadConnected = (e: GamepadEvent): void => {
      gamepadIndex = e.gamepad.index;
      setState((prev) => ({ ...prev, connected: true }));
    };

    const handleGamepadDisconnected = (e: GamepadEvent): void => {
      if (e.gamepad.index === gamepadIndex) {
        gamepadIndex = null;
        setState({
          connected: false,
          leftStickX: 0,
          leftStickY: 0,
          rightStickX: 0,
          rightStickY: 0,
          triggers: { left: 0, right: 0 },
          buttons: {
            a: false,
            b: false,
            x: false,
            y: false,
            dpadUp: false,
            dpadDown: false,
            dpadLeft: false,
            dpadRight: false,
            leftBumper: false,
            rightBumper: false,
            leftStickPress: false,
            rightStickPress: false,
          },
        });
      }
    };

    const pollGamepad = (): void => {
      const gamepads = navigator.getGamepads();
      const gamepad =
        // eslint-disable-next-line security/detect-object-injection -- gamepadIndex is controlled number, safe array access
        gamepadIndex !== null ? gamepads[gamepadIndex] : gamepads[0];

      if (gamepad) {
        // Xbox controller mapping (standard layout):
        // Axes: 0=LeftX, 1=LeftY, 2=RightX, 3=RightY
        // Buttons: 6=LT, 7=RT (as buttons), 11=RightStickPress

        const leftStickX = applyDeadzone(gamepad.axes[0] || 0, DEADZONE);
        const leftStickY = applyDeadzone(gamepad.axes[1] || 0, DEADZONE);
        const rightStickX = applyDeadzone(gamepad.axes[2] || 0, DEADZONE);
        const rightStickY = applyDeadzone(gamepad.axes[3] || 0, DEADZONE);

        // Triggers can be buttons or axes depending on browser/controller
        const leftTrigger =
          gamepad.buttons[6]?.value || (gamepad.axes[4] + 1) / 2 || 0;
        const rightTrigger =
          gamepad.buttons[7]?.value || (gamepad.axes[5] + 1) / 2 || 0;

        // Face buttons (A = button 0, B = button 1, X = button 2, Y = button 3)
        const aButton = gamepad.buttons[0]?.pressed || false;
        const bButton = gamepad.buttons[1]?.pressed || false;
        const xButton = gamepad.buttons[2]?.pressed || false;
        const yButton = gamepad.buttons[3]?.pressed || false;

        // D-Pad buttons (Up = 12, Down = 13, Left = 14, Right = 15)
        const dpadUp = gamepad.buttons[12]?.pressed || false;
        const dpadDown = gamepad.buttons[13]?.pressed || false;
        const dpadLeft = gamepad.buttons[14]?.pressed || false;
        const dpadRight = gamepad.buttons[15]?.pressed || false;

        // Shoulder buttons (LB = button 4, RB = button 5)
        const leftBumper = gamepad.buttons[4]?.pressed || false;
        const rightBumper = gamepad.buttons[5]?.pressed || false;

        // Stick buttons (L3 = button 10, R3 = button 11)
        const leftStickPress = gamepad.buttons[10]?.pressed || false;
        const rightStickPress = gamepad.buttons[11]?.pressed || false;

        setState({
          connected: true,
          leftStickX,
          leftStickY,
          rightStickX,
          rightStickY,
          triggers: {
            left: leftTrigger,
            right: rightTrigger,
          },
          buttons: {
            a: aButton,
            b: bButton,
            x: xButton,
            y: yButton,
            dpadUp,
            dpadDown,
            dpadLeft,
            dpadRight,
            leftBumper,
            rightBumper,
            leftStickPress,
            rightStickPress,
          },
        });
      } else if (gamepadIndex !== null) {
        // Gamepad was connected but now missing
        setState({
          connected: false,
          leftStickX: 0,
          leftStickY: 0,
          rightStickX: 0,
          rightStickY: 0,
          triggers: { left: 0, right: 0 },
          buttons: {
            a: false,
            b: false,
            x: false,
            y: false,
            dpadUp: false,
            dpadDown: false,
            dpadLeft: false,
            dpadRight: false,
            leftBumper: false,
            rightBumper: false,
            leftStickPress: false,
            rightStickPress: false,
          },
        });
      }

      animationFrameRef.current = requestAnimationFrame(pollGamepad);
    };

    // Start polling
    animationFrameRef.current = requestAnimationFrame(pollGamepad);

    // Listen for gamepad connection events
    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener(
        'gamepaddisconnected',
        handleGamepadDisconnected
      );
    };
  }, []);

  return state;
}
