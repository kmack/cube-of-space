/**
 * @fileoverview Strategy pattern implementation for label positioning including
 * dynamic camera-based positioning to avoid z-fighting with faces.
 */

// src/utils/label-positioning.ts
import * as THREE from 'three';

import { LABEL_OFFSET } from '../data/constants';
import type { HebrewLetter } from '../data/label-spec';
import type { Vec3 } from './types';

/**
 * Interface for label positioning strategies
 *
 * Different types of labels (vertical axis, horizontal axis) require
 * different positioning logic to avoid z-fighting and ensure visibility.
 * This interface enables the Strategy Pattern for flexible positioning.
 */
export interface LabelPositioningStrategy {
  /**
   * Calculate the static offset position for a label
   *
   * Used for initial positioning and for labels that don't need
   * dynamic camera-based positioning.
   *
   * @param basePos - Base position of the label
   * @returns Offset position as Vec3
   */
  calculateStaticPosition(basePos: Vec3): Vec3;

  /**
   * Calculate dynamic position based on camera location
   *
   * Used for labels that need to track camera position to remain visible
   * and avoid occlusion by geometry.
   *
   * @param basePos - Base position of the label
   * @param camera - Three.js camera object
   * @returns Dynamic position as Vec3
   */
  calculateDynamicPosition(basePos: Vec3, camera: THREE.Camera): Vec3;

  /**
   * Whether this strategy requires dynamic updates every frame
   *
   * @returns True if position needs to be recalculated each frame
   */
  isDynamic(): boolean;
}

/**
 * Positioning strategy for vertical axis labels (Aleph)
 *
 * Vertical axis labels need to dynamically offset toward the camera
 * in the horizontal plane to remain visible as the camera rotates.
 *
 * The offset projects the camera direction onto the horizontal plane
 * (removing Y component) to push the label away from the vertical axis line.
 */
export class VerticalAxisPositioning implements LabelPositioningStrategy {
  private readonly labelOffset: number;

  constructor(labelOffset: number = LABEL_OFFSET) {
    this.labelOffset = labelOffset;
  }

  calculateStaticPosition(basePos: Vec3): Vec3 {
    // For vertical axis, static position is just the base position
    // Dynamic calculation will override this
    return [...basePos];
  }

  calculateDynamicPosition(basePos: Vec3, camera: THREE.Camera): Vec3 {
    const labelPos = new THREE.Vector3(...basePos);
    const cameraPos = camera.position.clone();
    const toCamera = cameraPos.sub(labelPos).normalize();

    // Project the camera direction onto the horizontal plane (remove Y component)
    toCamera.y = 0;
    toCamera.normalize();

    // Calculate dynamic offset position
    return [
      basePos[0] + toCamera.x * this.labelOffset,
      basePos[1],
      basePos[2] + toCamera.z * this.labelOffset,
    ];
  }

  isDynamic(): boolean {
    return true;
  }
}

/**
 * Positioning strategy for horizontal axis labels (Mem, Shin)
 *
 * Horizontal axis labels use a static upward offset to avoid z-fighting
 * with the axis lines. They don't need dynamic camera-based positioning.
 */
export class HorizontalAxisPositioning implements LabelPositioningStrategy {
  private readonly labelOffset: number;

  constructor(labelOffset: number = LABEL_OFFSET) {
    this.labelOffset = labelOffset;
  }

  calculateStaticPosition(basePos: Vec3): Vec3 {
    // Offset upward (positive Y) to avoid z-fighting with axis lines
    const offsetPos: Vec3 = [...basePos];
    offsetPos[1] += this.labelOffset;
    return offsetPos;
  }

  calculateDynamicPosition(basePos: Vec3, _camera: THREE.Camera): Vec3 {
    // Horizontal axis labels don't need dynamic positioning
    // Just return the static offset position
    return this.calculateStaticPosition(basePos);
  }

  isDynamic(): boolean {
    return false;
  }
}

/**
 * Factory for creating appropriate positioning strategy based on axis letter
 *
 * Encapsulates the logic of determining which strategy to use for each
 * mother letter (Aleph, Mem, Shin).
 */
export class LabelPositioningStrategyFactory {
  /**
   * Create positioning strategy for a given mother letter
   *
   * @param letter - Mother letter (Aleph, Mem, or Shin)
   * @param labelOffset - Offset distance (default: LABEL_OFFSET)
   * @returns Appropriate positioning strategy instance
   *
   * @example
   * ```typescript
   * const strategy = LabelPositioningStrategyFactory.createStrategy('Aleph');
   * const position = strategy.calculateDynamicPosition(basePos, camera);
   * ```
   */
  static createStrategy(
    letter: HebrewLetter,
    labelOffset: number = LABEL_OFFSET
  ): LabelPositioningStrategy {
    if (letter === 'Aleph') {
      // Vertical axis (Y) requires dynamic camera-based positioning
      return new VerticalAxisPositioning(labelOffset);
    } else {
      // Horizontal axes (Mem = X, Shin = Z) use static upward offset
      return new HorizontalAxisPositioning(labelOffset);
    }
  }

  /**
   * Check if a letter requires dynamic positioning
   *
   * Useful for optimization - can skip frame updates for static labels.
   *
   * @param letter - Mother letter to check
   * @returns True if letter requires dynamic positioning
   */
  static requiresDynamicPositioning(letter: HebrewLetter): boolean {
    return letter === 'Aleph';
  }
}

/**
 * Utility class for common label positioning operations
 */
export class LabelPositioningUtils {
  /**
   * Calculate initial position for a label using its strategy
   *
   * @param basePos - Base position
   * @param strategy - Positioning strategy
   * @param camera - Camera (for dynamic strategies)
   * @returns Initial position
   */
  static calculateInitialPosition(
    basePos: Vec3,
    strategy: LabelPositioningStrategy,
    camera?: THREE.Camera
  ): Vec3 {
    if (strategy.isDynamic() && camera) {
      return strategy.calculateDynamicPosition(basePos, camera);
    }
    return strategy.calculateStaticPosition(basePos);
  }

  /**
   * Calculate position update for a frame
   *
   * Handles both dynamic and static positioning strategies.
   *
   * @param basePos - Base position
   * @param strategy - Positioning strategy
   * @param camera - Camera object
   * @returns Updated position
   */
  static calculateFramePosition(
    basePos: Vec3,
    strategy: LabelPositioningStrategy,
    camera: THREE.Camera
  ): Vec3 {
    if (strategy.isDynamic()) {
      return strategy.calculateDynamicPosition(basePos, camera);
    }
    return strategy.calculateStaticPosition(basePos);
  }
}
