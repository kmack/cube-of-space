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
}
