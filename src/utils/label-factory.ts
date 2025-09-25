// src/utils/label-factory.ts
import { getSpec } from '../data/label-spec';
import { getTarotImagePath } from './tarot-images';
import type { HebrewLetter } from '../data/label-spec';
import type { LabelData } from '../types/component-props';

/**
 * Creates standardized label data for any Hebrew letter.
 * Eliminates duplication across EdgeLabels, FaceLabels, and MotherLabels components.
 *
 * @param letter - The Hebrew letter to create label data for
 * @returns Complete label data including title, glyph, subtitle, and image path
 */
export function createLabelData(letter: HebrewLetter): LabelData {
  const spec = getSpec(letter);
  return {
    title: `Key ${spec.keyNumber} – ${spec.keyName}`,
    glyph: spec.letterChar,
    subtitle: `${spec.letterName} — ${spec.association.value}`,
    imagePath: getTarotImagePath(spec.keyNumber),
  };
}
