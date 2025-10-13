// src/hooks/use-gamepad.ts
import { useEffect, useRef, useState } from 'react';

export interface GamepadState {
  connected: boolean;
  rightStickX: number;
  rightStickY: number;
  triggers: {
    left: number;
    right: number;
  };
}

const DEADZONE = 0.15; // Ignore small stick movements

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
    rightStickX: 0,
    rightStickY: 0,
    triggers: { left: 0, right: 0 },
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
          rightStickX: 0,
          rightStickY: 0,
          triggers: { left: 0, right: 0 },
        });
      }
    };

    const pollGamepad = (): void => {
      const gamepads = navigator.getGamepads();
      const gamepad =
        gamepadIndex !== null ? gamepads[gamepadIndex] : gamepads[0];

      if (gamepad) {
        // Xbox controller mapping (standard layout):
        // Axes: 0=LeftX, 1=LeftY, 2=RightX, 3=RightY
        // Buttons: 6=LT, 7=RT (as buttons), or axes 2,5 (as analog)

        const rightStickX = applyDeadzone(gamepad.axes[2] || 0, DEADZONE);
        const rightStickY = applyDeadzone(gamepad.axes[3] || 0, DEADZONE);

        // Triggers can be buttons or axes depending on browser/controller
        const leftTrigger =
          gamepad.buttons[6]?.value || (gamepad.axes[4] + 1) / 2 || 0;
        const rightTrigger =
          gamepad.buttons[7]?.value || (gamepad.axes[5] + 1) / 2 || 0;

        setState({
          connected: true,
          rightStickX,
          rightStickY,
          triggers: {
            left: leftTrigger,
            right: rightTrigger,
          },
        });
      } else if (gamepadIndex !== null) {
        // Gamepad was connected but now missing
        setState({
          connected: false,
          rightStickX: 0,
          rightStickY: 0,
          triggers: { left: 0, right: 0 },
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
