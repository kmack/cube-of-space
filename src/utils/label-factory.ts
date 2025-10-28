/**
 * @fileoverview Factory for creating standardized label data from Hebrew letters
 * with Tarot correspondences, glyphs, and image paths.
 */

// src/utils/label-factory.ts
import type { HebrewLetter } from '../data/label-spec';
import {
  associationToGlyph,
  getSpec,
  outerPlanetToGlyph,
} from '../data/label-spec';
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

  // Build subtitle with outer planet if present (Mother letters only)
  let subtitle = `${spec.letterName} — ${assocName} ${assocGlyph}`;
  if (spec.outerPlanet) {
    const outerGlyph = outerPlanetToGlyph(spec.outerPlanet);
    subtitle += ` / ${spec.outerPlanet} ${outerGlyph}`;
  }

  return {
    title: `Key ${spec.keyNumber} – ${spec.keyName}`,
    glyph: spec.letterChar,
    subtitle,
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
    intelligence: spec.intelligence,
    outerPlanet: spec.outerPlanet,
    outerPlanetGlyph: spec.outerPlanet
      ? outerPlanetToGlyph(spec.outerPlanet)
      : undefined,
  };
}
