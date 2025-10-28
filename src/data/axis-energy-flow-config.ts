/**
 * @fileoverview Configuration for axis (Mother letter) energy flow animations
 * with bidirectional flow patterns and visualization parameters.
 */

// src/data/axis-energy-flow-config.ts

import type { Vec3 } from '../utils/types';
import { HALF } from './constants';
import type { FlowDirection } from './energy-flow-config';

/**
 * Hebrew letters that appear on cube axes (Mother letters)
 */
export type AxisHebrewLetter = 'Aleph' | 'Mem' | 'Shin';

/**
 * Axis orientation in 3D space
 */
export type AxisOrientation = 'vertical' | 'horizontal-x' | 'horizontal-z';

/**
 * Flow pattern for axis energy visualization
 */
export type AxisFlowPattern = 'center-to-faces' | 'directional';

/**
 * Single axis flow segment configuration
 */
export interface AxisFlowSegment {
  readonly name: string;
  readonly startPos: Vec3;
  readonly endPos: Vec3;
  readonly direction: FlowDirection;
  readonly color: string;
  readonly letter: AxisHebrewLetter;
  readonly orientation: AxisOrientation;
}

/**
 * Complete axis flow configuration with metadata
 */
export interface AxisFlowConfiguration {
  readonly letter: AxisHebrewLetter;
  readonly orientation: AxisOrientation;
  readonly color: string;
  readonly elementalCorrespondence: string;
  readonly reasoning: string;
  readonly segments: {
    readonly centerToFaces: readonly AxisFlowSegment[];
    readonly directional: readonly AxisFlowSegment[];
  };
}

/**
 * Elemental correspondences for the three Mother letters
 */
const AXIS_ELEMENTAL_CORRESPONDENCES: Record<AxisHebrewLetter, string> = {
  Aleph: 'Air - Vertical Axis (Above/Below)',
  Mem: 'Water - Horizontal X-Axis (East/West)',
  Shin: 'Fire - Horizontal Z-Axis (North/South)',
};

/**
 * Reasoning behind axis energy flow directions
 */
const AXIS_FLOW_REASONING: Record<AxisHebrewLetter, string> = {
  Aleph:
    'Air element ascends and descends through vertical axis, connecting Above (Mercury) to Below (Moon)',
  Mem: 'Water element flows horizontally East-West, connecting East (Venus) to West (Jupiter)',
  Shin: 'Fire element flows horizontally North-South, connecting North (Mars) to South (Sun)',
};

/**
 * Traditional mystical colors for Mother letters
 */
const AXIS_COLORS: Record<AxisHebrewLetter, string> = {
  Aleph: '#ffff00', // Yellow - Air element
  Mem: '#0000ff', // Blue - Water element
  Shin: '#ff0000', // Red - Fire element
};

/**
 * Axis orientations for Mother letters
 */
const AXIS_ORIENTATIONS: Record<AxisHebrewLetter, AxisOrientation> = {
  Aleph: 'vertical',
  Mem: 'horizontal-x',
  Shin: 'horizontal-z',
};

/**
 * Generate flow segments for center-to-faces pattern
 * Energy emanates from center to all six face directions
 */
function createCenterToFacesFlows(
  letter: AxisHebrewLetter,
  orientation: AxisOrientation,
  color: string
): AxisFlowSegment[] {
  const centerPos: Vec3 = [0, 0, 0];

  switch (orientation) {
    case 'vertical': {
      // Aleph: Two flows from center upward and downward
      return [
        {
          name: 'vertical-up',
          startPos: centerPos,
          endPos: [0, HALF, 0],
          direction: 'positive',
          color,
          letter,
          orientation,
        },
        {
          name: 'vertical-down',
          startPos: centerPos,
          endPos: [0, -HALF, 0],
          direction: 'positive',
          color,
          letter,
          orientation,
        },
      ];
    }

    case 'horizontal-x': {
      // Mem: Two flows from center east and west
      return [
        {
          name: 'horizontal-x-east',
          startPos: centerPos,
          endPos: [HALF, 0, 0],
          direction: 'positive',
          color,
          letter,
          orientation,
        },
        {
          name: 'horizontal-x-west',
          startPos: centerPos,
          endPos: [-HALF, 0, 0],
          direction: 'positive',
          color,
          letter,
          orientation,
        },
      ];
    }

    case 'horizontal-z': {
      // Shin: Two flows from center north and south
      return [
        {
          name: 'horizontal-z-south',
          startPos: centerPos,
          endPos: [0, 0, HALF],
          direction: 'positive',
          color,
          letter,
          orientation,
        },
        {
          name: 'horizontal-z-north',
          startPos: centerPos,
          endPos: [0, 0, -HALF],
          direction: 'positive',
          color,
          letter,
          orientation,
        },
      ];
    }
  }
}

/**
 * Generate flow segments for directional pattern
 * Energy flows through the axis in a single direction
 */
function createDirectionalFlows(
  letter: AxisHebrewLetter,
  orientation: AxisOrientation,
  color: string
): AxisFlowSegment[] {
  switch (orientation) {
    case 'vertical': {
      // Aleph: Flow from Above to Below (descending air)
      return [
        {
          name: 'vertical-above-to-below',
          startPos: [0, HALF, 0],
          endPos: [0, -HALF, 0],
          direction: 'positive',
          color,
          letter,
          orientation,
        },
      ];
    }

    case 'horizontal-x': {
      // Mem: Flow from East to West (water flows west)
      return [
        {
          name: 'horizontal-x-east-to-west',
          startPos: [HALF, 0, 0],
          endPos: [-HALF, 0, 0],
          direction: 'positive',
          color,
          letter,
          orientation,
        },
      ];
    }

    case 'horizontal-z': {
      // Shin: Flow from North to South (fire rises south toward sun)
      return [
        {
          name: 'horizontal-z-north-to-south',
          startPos: [0, 0, -HALF],
          endPos: [0, 0, HALF],
          direction: 'positive',
          color,
          letter,
          orientation,
        },
      ];
    }
  }
}

/**
 * Build complete axis flow configuration
 */
function buildAxisConfiguration(
  letter: AxisHebrewLetter
): AxisFlowConfiguration {
  // eslint-disable-next-line security/detect-object-injection -- letter is TypeScript-typed AxisHebrewLetter, safe indexed access
  const orientation = AXIS_ORIENTATIONS[letter];
  // eslint-disable-next-line security/detect-object-injection -- letter is TypeScript-typed AxisHebrewLetter, safe indexed access
  const color = AXIS_COLORS[letter];

  return {
    letter,
    orientation,
    color,
    // eslint-disable-next-line security/detect-object-injection -- letter is TypeScript-typed AxisHebrewLetter, safe indexed access
    elementalCorrespondence: AXIS_ELEMENTAL_CORRESPONDENCES[letter],
    // eslint-disable-next-line security/detect-object-injection -- letter is TypeScript-typed AxisHebrewLetter, safe indexed access
    reasoning: AXIS_FLOW_REASONING[letter],
    segments: {
      centerToFaces: createCenterToFacesFlows(letter, orientation, color),
      directional: createDirectionalFlows(letter, orientation, color),
    },
  };
}

/**
 * Pre-built configurations for all three Mother letter axes
 */
const AXIS_CONFIGURATIONS: Record<AxisHebrewLetter, AxisFlowConfiguration> = {
  Aleph: buildAxisConfiguration('Aleph'),
  Mem: buildAxisConfiguration('Mem'),
  Shin: buildAxisConfiguration('Shin'),
};

/**
 * Centralized axis energy flow configuration for the Cube of Space.
 * Provides flow patterns, colors, and elemental correspondences for Mother letter axes.
 */
export const AXIS_ENERGY_FLOW_CONFIG = {
  /**
   * Get the flow color for a given Mother letter axis.
   */
  getColor: (letter: AxisHebrewLetter): string =>
    // eslint-disable-next-line security/detect-object-injection -- letter is TypeScript-typed AxisHebrewLetter, safe indexed access
    AXIS_COLORS[letter],

  /**
   * Get the axis orientation for a given Mother letter.
   */
  getOrientation: (letter: AxisHebrewLetter): AxisOrientation =>
    // eslint-disable-next-line security/detect-object-injection -- letter is TypeScript-typed AxisHebrewLetter, safe indexed access
    AXIS_ORIENTATIONS[letter],

  /**
   * Get the elemental correspondence for a given Mother letter axis.
   */
  getElementalCorrespondence: (letter: AxisHebrewLetter): string =>
    // eslint-disable-next-line security/detect-object-injection -- letter is TypeScript-typed AxisHebrewLetter, safe indexed access
    AXIS_ELEMENTAL_CORRESPONDENCES[letter],

  /**
   * Get the reasoning for a given Mother letter axis flow.
   */
  getReasoning: (letter: AxisHebrewLetter): string =>
    // eslint-disable-next-line security/detect-object-injection -- letter is TypeScript-typed AxisHebrewLetter, safe indexed access
    AXIS_FLOW_REASONING[letter],

  /**
   * Get complete configuration for a Mother letter axis.
   */
  getConfiguration: (letter: AxisHebrewLetter): AxisFlowConfiguration =>
    // eslint-disable-next-line security/detect-object-injection -- letter is TypeScript-typed AxisHebrewLetter, safe indexed access
    AXIS_CONFIGURATIONS[letter],

  /**
   * Get all flow segments for a specific pattern.
   */
  getFlowSegments: (pattern: AxisFlowPattern): readonly AxisFlowSegment[] => {
    const allConfigs = Object.values(AXIS_CONFIGURATIONS);

    if (pattern === 'center-to-faces') {
      return allConfigs.flatMap((config) => config.segments.centerToFaces);
    } else {
      return allConfigs.flatMap((config) => config.segments.directional);
    }
  },

  /**
   * Get all Mother letter axes.
   */
  getAllAxes: (): AxisHebrewLetter[] => ['Aleph', 'Mem', 'Shin'],

  /**
   * Check if a letter is a Mother letter with axis energy flow.
   */
  isAxisLetter: (letter: string): letter is AxisHebrewLetter =>
    letter === 'Aleph' || letter === 'Mem' || letter === 'Shin',

  // Export raw configurations for advanced usage
  configurations: AXIS_CONFIGURATIONS,
  colors: AXIS_COLORS,
  orientations: AXIS_ORIENTATIONS,
  elementalCorrespondences: AXIS_ELEMENTAL_CORRESPONDENCES,
  reasoning: AXIS_FLOW_REASONING,
} as const;
