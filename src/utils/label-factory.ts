// src/utils/label-factory.ts
import type { HebrewLetter } from '../data/label-spec';
import { associationToGlyph, getSpec } from '../data/label-spec';
import type { LabelData } from '../types/component-props';
import { getTarotImagePath } from './tarot-images';

/**
 * Creates standardized label data for any Hebrew letter.
 * Eliminates duplication across EdgeLabels, FaceLabels, and MotherLabels components.
 *
 * @param letter - The Hebrew letter to create label data for
 * @returns Complete label data including title, glyph, subtitle, image path, and all correspondences
 */
export function createLabelData(letter: HebrewLetter): LabelData {
  const spec = getSpec(letter);
  const assocGlyph = associationToGlyph(spec.association);
  const assocName = spec.association.value;
  return {
    title: `Key ${spec.keyNumber} – ${spec.keyName}`,
    glyph: spec.letterChar,
    subtitle: `${spec.letterName} — ${assocName} ${assocGlyph}`,
    imagePath: getTarotImagePath(spec.keyNumber),
    letterName: spec.letterName,
    assocGlyph,
    assocName,
    color: spec.color,
    colorValue: spec.colorValue,
    note: spec.note,
    significance: spec.significance,
    gematria: spec.gematria,
    alchemy: spec.alchemy,
  };
}
