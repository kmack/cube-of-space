/**
 * @fileoverview Shared label component utilities including base props, animated
 * label helpers, and rich label rendering logic.
 */

// src/utils/label-utils.tsx
import * as React from 'react';

import { LABEL_OFFSET } from '../data/constants';
import type { HebrewLetter } from '../data/label-spec';
import type { LabelData } from '../types/component-props';
import { createLabelData } from './label-factory';

/**
 * Common props shared by all label components
 */
export interface BaseLabelProps {
  useMemoryOptimization?: boolean;
  doubleSided?: boolean;
  showColorBorders?: boolean;
}

/**
 * Props for animated label components (mother letters, diagonals)
 */
export interface AnimatedLabelProps extends BaseLabelProps {
  isAnimationActive?: boolean;
  isMobile?: boolean;
}

/**
 * Standard font configuration used across all labels
 */
export const LABEL_FONTS = {
  hebrew: 'FrankRuhlLibre, serif',
  ui: 'Inter, sans-serif',
} as const;

/**
 * Calculate offset position by pushing outward from center along component axes
 * This is the common pattern used by face-labels and edge-labels
 *
 * @param basePos - Base position [x, y, z]
 * @param offset - Offset distance (default: LABEL_OFFSET)
 * @returns Offset position [x, y, z]
 */
export function calculateAxisAlignedOffset(
  basePos: readonly [number, number, number],
  offset: number = LABEL_OFFSET
): [number, number, number] {
  return [
    basePos[0] + (basePos[0] > 0 ? offset : basePos[0] < 0 ? -offset : 0),
    basePos[1] + (basePos[1] > 0 ? offset : basePos[1] < 0 ? -offset : 0),
    basePos[2] + (basePos[2] > 0 ? offset : basePos[2] < 0 ? -offset : 0),
  ];
}

/**
 * Hook to memoize label data creation
 * Prevents recreation of label data on every render
 *
 * @param letter - Hebrew letter identifier
 * @returns Memoized label data
 */
export function useLabelData(letter: HebrewLetter): LabelData {
  return React.useMemo(() => createLabelData(letter), [letter]);
}

/**
 * Hook to memoize array of label data
 * Prevents recreation when component re-renders
 *
 * @param letters - Array of Hebrew letter identifiers
 * @returns Memoized array of label data
 */
export function useLabelDataArray(
  letters: readonly HebrewLetter[]
): LabelData[] {
  return React.useMemo(
    () => letters.map((letter) => createLabelData(letter)),
    [letters]
  );
}

/**
 * Common RichLabel props interface
 * Extracts the shared properties across all label usages
 */
export interface RichLabelCommonProps {
  title: string;
  subtitle?: string;
  hebrewLetter?: string;
  letterName?: string;
  assocGlyph?: string;
  assocName?: string;
  colorName?: string;
  colorValue?: string;
  note?: string;
  significance?: string;
  gematria?: number;
  alchemy?: string;
  intelligence?: string;
  imagePath?: string;
  scale: number;
  background: string;
  useMemoryOptimization: boolean;
  doubleSided: boolean;
}

/**
 * Extract common RichLabel props from label data
 * Reduces boilerplate when rendering RichLabel components
 *
 * @param labelData - Label data from label factory
 * @param scale - Label scale factor
 * @param background - Background color
 * @param useMemoryOptimization - Enable memory optimizations
 * @param doubleSided - Render both sides of label
 * @returns Props object for RichLabel component
 */
export function createRichLabelProps(
  labelData: LabelData,
  scale: number,
  background: string,
  useMemoryOptimization: boolean,
  doubleSided: boolean
): RichLabelCommonProps {
  return {
    title: labelData.title,
    subtitle: labelData.subtitle,
    hebrewLetter: labelData.glyph,
    letterName: labelData.letterName,
    assocGlyph: labelData.assocGlyph,
    assocName: labelData.assocName,
    colorName: labelData.color,
    colorValue: labelData.colorValue,
    note: labelData.note,
    significance: labelData.significance,
    gematria: labelData.gematria,
    alchemy: labelData.alchemy,
    intelligence: labelData.intelligence,
    imagePath: labelData.imagePath,
    scale,
    background,
    useMemoryOptimization,
    doubleSided,
  };
}

/**
 * Create a memoized label info object with position, rotation, and label data
 * Common pattern for face and edge labels
 */
export interface LabelInfo<T = unknown> {
  labelData: LabelData;
  offsetPos: [number, number, number];
  rotation: T;
}

/**
 * Default props for label components
 */
export const DEFAULT_LABEL_PROPS = {
  useMemoryOptimization: true,
  doubleSided: false,
} as const;

/**
 * Default props for animated label components
 */
export const DEFAULT_ANIMATED_LABEL_PROPS = {
  ...DEFAULT_LABEL_PROPS,
  isAnimationActive: true,
  isMobile: false,
} as const;
