// src/types/component-props.ts
import type { HebrewLetter } from '../data/label-spec';

/**
 * Tarot Key numbers (0-21 for Major Arcana).
 */
export type TarotKeyNumber =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21;

/**
 * Hebrew letters categorized by their role in the Cube of Space.
 */
export type MotherLetter = Extract<HebrewLetter, 'Aleph' | 'Mem' | 'Shin'>;
export type DoubleLetter = Extract<
  HebrewLetter,
  'Beth' | 'Gimel' | 'Daleth' | 'Kaph' | 'Peh' | 'Resh' | 'Tav'
>;
export type SimpleLetter = Extract<
  HebrewLetter,
  | 'Heh'
  | 'Vav'
  | 'Zain'
  | 'Cheth'
  | 'Teth'
  | 'Yod'
  | 'Lamed'
  | 'Nun'
  | 'Samekh'
  | 'Ayin'
  | 'Tzaddi'
  | 'Qoph'
>;

/**
 * Base props for visualization components.
 */
export interface BaseVisualizationProps {
  visible?: boolean;
  opacity?: number;
}

/**
 * Props for positioned components.
 */
export interface PositionedComponentProps extends BaseVisualizationProps {
  fontSize?: number;
  color?: string;
  offset?: number;
}

/**
 * Enhanced label data with stricter typing.
 */
export interface LabelData {
  title: string; // Keep flexible for dynamic key numbers
  glyph: string;
  subtitle: string;
  imagePath: string;
  // New fields for improved layout
  letterName: string; // e.g., "Aleph"
  assocGlyph: string; // e.g., "♈" or "🜁"
  assocName: string; // e.g., "Aries" or "Air"
  // Additional correspondences
  color: string; // Color name (e.g., "Yellow", "Blue")
  colorValue: string; // CSS color value (e.g., "#FFFF00")
  note: string; // Musical note (e.g., "E", "G#")
  significance: string; // Letter meaning (e.g., "bull", "water")
  gematria: number; // Numeric value
  alchemy: string; // Alchemical correspondence (e.g., "Air", "Gold")
  intelligence: string; // The Intelligence from Sepher Yetzirah
  // Secondary outer planet attribution (Mother letters only)
  outerPlanet?: string; // e.g., "Uranus", "Neptune", "Pluto"
  outerPlanetGlyph?: string; // e.g., "♅", "♆", "♇"
}
