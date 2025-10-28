/**
 * @fileoverview React hooks for Leva control state management including toggle
 * and cycle callbacks with proper memoization.
 */

// src/utils/control-utils.ts
import * as React from 'react';

/**
 * Creates a memoized toggle callback for boolean Leva controls
 *
 * This utility eliminates the repetitive pattern of creating toggle callbacks
 * for Leva control state updates. Instead of writing:
 *
 * ```tsx
 * const handleToggleFoo = React.useCallback(() => {
 *   setControls({ foo: !foo });
 * }, [foo, setControls]);
 * ```
 *
 * You can now write:
 *
 * ```tsx
 * const handleToggleFoo = useToggleCallback(setControls, 'foo', foo);
 * ```
 *
 * @param setter - The Leva control setter function (e.g., setLetters, setFaces)
 * @param key - The key of the control to toggle
 * @param currentValue - The current boolean value of the control
 * @returns A memoized callback that toggles the boolean value
 *
 * @example
 * ```tsx
 * const [{ showFaces }, setFaces] = useControls('Faces', ...);
 * const handleToggleFaces = useToggleCallback(setFaces, 'showFaces', showFaces);
 * ```
 */
export function useToggleCallback<T extends Record<string, unknown>>(
  setter: (partial: Partial<T>) => void,
  key: keyof T,
  currentValue: boolean
): () => void {
  return React.useCallback(() => {
    setter({ [key]: !currentValue } as Partial<T>);
  }, [setter, key, currentValue]);
}

/**
 * Creates a memoized callback that cycles through enum values
 *
 * Useful for controls that toggle between multiple states (not just boolean).
 * For example, cycling through flow directions or render modes.
 *
 * @param setter - The Leva control setter function
 * @param key - The key of the control to cycle
 * @param currentValue - The current value of the control
 * @param values - Array of possible values to cycle through
 * @returns A memoized callback that cycles to the next value
 *
 * @example
 * ```tsx
 * const [{ flowDirection }, setFlow] = useControls('Flow', ...);
 * const handleCycleFlow = useCycleCallback(
 *   setFlow,
 *   'flowDirection',
 *   flowDirection,
 *   ['center-to-faces', 'directional']
 * );
 * ```
 */
export function useCycleCallback<T extends Record<string, unknown>, V>(
  setter: (partial: Partial<T>) => void,
  key: keyof T,
  currentValue: V,
  values: readonly V[]
): () => void {
  return React.useCallback(() => {
    const currentIndex = values.indexOf(currentValue);
    const nextIndex = (currentIndex + 1) % values.length;
    // eslint-disable-next-line security/detect-object-injection -- key is TypeScript-typed keyof T, safe indexed access
    setter({ [key]: values[nextIndex] } as Partial<T>);
  }, [setter, key, currentValue, values]);
}

/**
 * Creates multiple toggle callbacks at once for a control group
 *
 * This is useful when you have multiple boolean controls in the same group
 * and want to create all their toggle callbacks efficiently.
 *
 * @param setter - The Leva control setter function
 * @param controls - Object mapping control keys to their current boolean values
 * @returns Object with toggle callbacks for each control, keyed by control name
 *
 * @example
 * ```tsx
 * const [controls, setControls] = useControls('Letters', () => ({
 *   showMother: { value: true },
 *   showDouble: { value: true },
 *   showSingle: { value: true },
 * }));
 *
 * const toggles = useToggleCallbacks(setControls, {
 *   showMother: controls.showMother,
 *   showDouble: controls.showDouble,
 *   showSingle: controls.showSingle,
 * });
 *
 * // Use as: toggles.showMother(), toggles.showDouble(), etc.
 * ```
 */
export function useToggleCallbacks<T extends Record<string, unknown>>(
  setter: (partial: Partial<T>) => void,
  controls: { [K in keyof T]?: boolean }
): Record<keyof T, () => void> {
  const keys = Object.keys(controls) as Array<keyof T>;

  const callbacks = React.useMemo(() => {
    const result = {} as Record<keyof T, () => void>;

    for (const key of keys) {
      // eslint-disable-next-line security/detect-object-injection -- key is TypeScript-typed keyof T, safe indexed access
      const currentValue = controls[key];
      if (typeof currentValue === 'boolean') {
        // eslint-disable-next-line security/detect-object-injection -- key is TypeScript-typed keyof T, safe indexed access
        result[key] = () => {
          setter({ [key]: !currentValue } as Partial<T>);
        };
      }
    }

    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps,security/detect-object-injection -- controls values are primitives, safe to spread; k is TypeScript-typed keyof T, safe indexed access
  }, [setter, ...keys.map((k) => controls[k])]);

  return callbacks;
}
