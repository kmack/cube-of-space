/**
 * @fileoverview Complete specification of Hebrew letter to Tarot key mappings
 * with astrological associations (elements, planets, zodiac signs).
 */

// src/label-spec.ts
export type HebrewLetter =
  | 'Aleph'
  | 'Beth'
  | 'Gimel'
  | 'Daleth'
  | 'Heh'
  | 'Vav'
  | 'Zain'
  | 'Cheth'
  | 'Teth'
  | 'Yod'
  | 'Kaph'
  | 'Lamed'
  | 'Mem'
  | 'Nun'
  | 'Samekh'
  | 'Ayin'
  | 'Peh'
  | 'Tzaddi'
  | 'Qoph'
  | 'Resh'
  | 'Shin'
  | 'Tav'
  | 'Kaph-final'
  | 'Mem-final'
  | 'Nun-final'
  | 'Peh-final'
  | 'Tzaddi-final';

type Assoc =
  | { kind: 'element'; value: 'Air' | 'Water' | 'Fire' }
  | {
      kind: 'planet';
      value:
        | 'Saturn'
        | 'Jupiter'
        | 'Mars'
        | 'Sun'
        | 'Venus'
        | 'Mercury'
        | 'Moon';
    }
  | {
      kind: 'zodiac';
      value:
        | 'Aries'
        | 'Taurus'
        | 'Gemini'
        | 'Cancer'
        | 'Leo'
        | 'Virgo'
        | 'Libra'
        | 'Scorpio'
        | 'Sagittarius'
        | 'Capricorn'
        | 'Aquarius'
        | 'Pisces';
    };

// Secondary outer planet attribution for Mother letters only
type OuterPlanet = 'Uranus' | 'Neptune' | 'Pluto';

export type LetterSpec = {
  letterChar: string; // Hebrew glyph as a single char (or image elsewhere)
  letterName: string; // English name (display string)
  keyNumber: number; // Tarot Major Arcana number (0..21 in B.O.T.A. scheme)
  keyName: string; // Tarot Key title
  association: Assoc; // Element / planet / zodiac
  color: string; // Associated color name (e.g., "Yellow", "Blue")
  colorValue: string; // CSS color value for the color (e.g., "#FFFF00", "rgb(255,255,0)")
  note: string; // Musical note
  significance: string; // Letter meaning/significance
  gematria: number; // Numeric value
  alchemy: string; // Alchemical correspondence
  intelligence: string; // The Intelligence from Sepher Yetzirah
  outerPlanet?: OuterPlanet; // Secondary outer planet attribution (Mother letters only)
};

const ZODIAC_GLYPHS: Record<
  Extract<Assoc, { kind: 'zodiac' }>['value'],
  string
> = {
  Aries: '♈',
  Taurus: '♉',
  Gemini: '♊',
  Cancer: '♋',
  Leo: '♌',
  Virgo: '♍',
  Libra: '♎',
  Scorpio: '♏',
  Sagittarius: '♐',
  Capricorn: '♑',
  Aquarius: '♒',
  Pisces: '♓',
};

const PLANET_GLYPHS: Record<
  Extract<Assoc, { kind: 'planet' }>['value'],
  string
> = {
  Sun: '☉',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
};

const ELEMENT_GLYPHS: Record<
  Extract<Assoc, { kind: 'element' }>['value'],
  string
> = {
  Air: '🜁', // alchemical symbol
  Water: '🜄', // alchemical symbol
  Fire: '🜂', // alchemical symbol
};

const OUTER_PLANET_GLYPHS: Record<OuterPlanet, string> = {
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇',
};

export function associationToGlyph(a: Assoc): string {
  switch (a.kind) {
    case 'zodiac':
      return ZODIAC_GLYPHS[a.value];
    case 'planet':
      return PLANET_GLYPHS[a.value];
    case 'element':
      return ELEMENT_GLYPHS[a.value];
  }
}

export function outerPlanetToGlyph(planet: OuterPlanet): string {
  // eslint-disable-next-line security/detect-object-injection -- planet is TypeScript-typed OuterPlanet, safe indexed access
  return OUTER_PLANET_GLYPHS[planet];
}

// ————————————
// Canonical attributions (B.O.T.A. / Golden Dawn):
// Mothers (elements), Doubles (planets), Simples (zodiac)
// ————————————

const S: Record<HebrewLetter, LetterSpec> = {
  // Mothers (with secondary outer planet attributions)
  Aleph: {
    letterChar: 'א',
    letterName: 'Aleph',
    keyNumber: 0,
    keyName: 'The Fool',
    association: { kind: 'element', value: 'Air' },
    color: 'Yellow',
    colorValue: '#FFFF00',
    note: 'E',
    significance: 'Bull',
    gematria: 1,
    alchemy: 'Air',
    intelligence: 'The Fiery Intelligence',
    outerPlanet: 'Uranus',
  },
  Mem: {
    letterChar: 'מ',
    letterName: 'Mem',
    keyNumber: 12,
    keyName: 'The Hanged Man',
    association: { kind: 'element', value: 'Water' },
    color: 'Blue',
    colorValue: '#0000FF',
    note: 'G#',
    significance: 'Water',
    gematria: 40,
    alchemy: 'Water',
    intelligence: 'The Renewing Intelligence',
    outerPlanet: 'Neptune',
  },
  Shin: {
    letterChar: 'ש',
    letterName: 'Shin',
    keyNumber: 20,
    keyName: 'Judgement',
    association: { kind: 'element', value: 'Fire' },
    color: 'Red',
    colorValue: '#FF0000',
    note: 'C',
    significance: 'Tooth',
    gematria: 300,
    alchemy: 'Fire',
    intelligence: 'The Perpetual Intelligence',
    outerPlanet: 'Pluto',
  },

  // Doubles (planets)
  Beth: {
    letterChar: 'ב',
    letterName: 'Beth',
    keyNumber: 1,
    keyName: 'The Magician',
    association: { kind: 'planet', value: 'Mercury' },
    color: 'Yellow',
    colorValue: '#FFFF00',
    note: 'E',
    significance: 'House',
    gematria: 2,
    alchemy: 'Mercury',
    intelligence: 'The Transparent Intelligence',
  },
  Gimel: {
    letterChar: 'ג',
    letterName: 'Gimel',
    keyNumber: 2,
    keyName: 'The High Priestess',
    association: { kind: 'planet', value: 'Moon' },
    color: 'Blue',
    colorValue: '#0000FF',
    note: 'G#',
    significance: 'Camel',
    gematria: 3,
    alchemy: 'Silver',
    intelligence: 'The Uniting Intelligence',
  },
  Daleth: {
    letterChar: 'ד',
    letterName: 'Daleth',
    keyNumber: 3,
    keyName: 'The Empress',
    association: { kind: 'planet', value: 'Venus' },
    color: 'Green',
    colorValue: '#00FF00',
    note: 'F#',
    significance: 'Door',
    gematria: 4,
    alchemy: 'Copper',
    intelligence: 'The Luminous Intelligence',
  },
  Kaph: {
    letterChar: 'כ',
    letterName: 'Kaph',
    keyNumber: 10,
    keyName: 'Wheel of Fortune',
    association: { kind: 'planet', value: 'Jupiter' },
    color: 'Violet',
    colorValue: '#8B00FF',
    note: 'A#',
    significance: 'Closed Hand',
    gematria: 20,
    alchemy: 'Tin',
    intelligence: 'The Faithful Intelligence',
  },
  Peh: {
    letterChar: 'פ',
    letterName: 'Peh',
    keyNumber: 16,
    keyName: 'The Tower',
    association: { kind: 'planet', value: 'Mars' },
    color: 'Red',
    colorValue: '#FF0000',
    note: 'C',
    significance: 'Mouth',
    gematria: 80,
    alchemy: 'Iron',
    intelligence: 'The Natural Intelligence',
  },
  Resh: {
    letterChar: 'ר',
    letterName: 'Resh',
    keyNumber: 19,
    keyName: 'The Sun',
    association: { kind: 'planet', value: 'Sun' },
    color: 'Orange',
    colorValue: '#FFA500',
    note: 'D',
    significance: 'Head',
    gematria: 200,
    alchemy: 'Gold',
    intelligence: 'The Collecting Intelligence',
  },
  Tav: {
    letterChar: 'ת',
    letterName: 'Tav',
    keyNumber: 21,
    keyName: 'The World',
    association: { kind: 'planet', value: 'Saturn' },
    color: 'Blue-Violet',
    colorValue: '#8A2BE2',
    note: 'A',
    significance: 'Mark',
    gematria: 400,
    alchemy: 'Lead',
    intelligence: 'The Administrative Intelligence',
  },

  // Simples (zodiac)
  Heh: {
    letterChar: 'ה',
    letterName: 'Heh',
    keyNumber: 4,
    keyName: 'The Emperor',
    association: { kind: 'zodiac', value: 'Aries' },
    color: 'Red',
    colorValue: '#FF0000',
    note: 'C',
    significance: 'Window',
    gematria: 5,
    alchemy: 'Fiery',
    intelligence: 'The Constituting Intelligence',
  },
  Vav: {
    letterChar: 'ו',
    letterName: 'Vav',
    keyNumber: 5,
    keyName: 'The Hierophant',
    association: { kind: 'zodiac', value: 'Taurus' },
    color: 'Red-Orange',
    colorValue: '#FF4500',
    note: 'C#',
    significance: 'Hook',
    gematria: 6,
    alchemy: 'Earthy',
    intelligence: 'The Triumphant and Eternal Intelligence',
  },
  Zain: {
    letterChar: 'ז',
    letterName: 'Zain',
    keyNumber: 6,
    keyName: 'The Lovers',
    association: { kind: 'zodiac', value: 'Gemini' },
    color: 'Orange',
    colorValue: '#FFA500',
    note: 'D',
    significance: 'Sword',
    gematria: 7,
    alchemy: 'Airy',
    intelligence: 'The Disposing Intelligence',
  },
  Cheth: {
    letterChar: 'ח',
    letterName: 'Cheth',
    keyNumber: 7,
    keyName: 'The Chariot',
    association: { kind: 'zodiac', value: 'Cancer' },
    color: 'Orange-Yellow',
    colorValue: '#FFB700',
    note: 'D#',
    significance: 'Fence',
    gematria: 8,
    alchemy: 'Watery',
    intelligence: 'The Intelligence of the House of Influence',
  },
  Teth: {
    letterChar: 'ט',
    letterName: 'Teth',
    keyNumber: 8,
    keyName: 'Strength',
    association: { kind: 'zodiac', value: 'Leo' },
    color: 'Yellow',
    colorValue: '#FFFF00',
    note: 'E',
    significance: 'Serpent',
    gematria: 9,
    alchemy: 'Fiery',
    intelligence: 'The Intelligence of the Secret of All Spiritual Activities',
  },
  Yod: {
    letterChar: 'י',
    letterName: 'Yod',
    keyNumber: 9,
    keyName: 'The Hermit',
    association: { kind: 'zodiac', value: 'Virgo' },
    color: 'Yellow-Green',
    colorValue: '#9ACD32',
    note: 'F',
    significance: 'Open Hand',
    gematria: 10,
    alchemy: 'Earthy',
    intelligence: 'The Intelligence of Will',
  },
  Lamed: {
    letterChar: 'ל',
    letterName: 'Lamed',
    keyNumber: 11,
    keyName: 'Justice',
    association: { kind: 'zodiac', value: 'Libra' },
    color: 'Green',
    colorValue: '#00FF00',
    note: 'F#',
    significance: 'Ox Goad',
    gematria: 30,
    alchemy: 'Airy',
    intelligence: 'The Stable Intelligence',
  },
  Nun: {
    letterChar: 'נ',
    letterName: 'Nun',
    keyNumber: 13,
    keyName: 'Death',
    association: { kind: 'zodiac', value: 'Scorpio' },
    color: 'Blue-Green',
    colorValue: '#00CED1',
    note: 'G',
    significance: 'Fish',
    gematria: 50,
    alchemy: 'Watery',
    intelligence: 'The Imaginative Intelligence',
  },
  Samekh: {
    letterChar: 'ס',
    letterName: 'Samekh',
    keyNumber: 14,
    keyName: 'Temperance',
    association: { kind: 'zodiac', value: 'Sagittarius' },
    color: 'Blue',
    colorValue: '#0000FF',
    note: 'G#',
    significance: 'Prop',
    gematria: 60,
    alchemy: 'Fiery',
    intelligence: 'The Probative Intelligence',
  },
  Ayin: {
    letterChar: 'ע',
    letterName: 'Ayin',
    keyNumber: 15,
    keyName: 'The Devil',
    association: { kind: 'zodiac', value: 'Capricorn' },
    color: 'Blue-Violet',
    colorValue: '#8A2BE2',
    note: 'A',
    significance: 'Eye',
    gematria: 70,
    alchemy: 'Earthy',
    intelligence: 'The Renovating Intelligence',
  },
  Tzaddi: {
    letterChar: 'צ',
    letterName: 'Tzaddi',
    keyNumber: 17,
    keyName: 'The Star',
    association: { kind: 'zodiac', value: 'Aquarius' },
    color: 'Violet',
    colorValue: '#8B00FF',
    note: 'A#',
    significance: 'Fish-Hook',
    gematria: 90,
    alchemy: 'Airy',
    intelligence: 'The Intelligence of Meditation',
  },
  Qoph: {
    letterChar: 'ק',
    letterName: 'Qoph',
    keyNumber: 18,
    keyName: 'The Moon',
    association: { kind: 'zodiac', value: 'Pisces' },
    color: 'Violet-Red',
    colorValue: '#C71585',
    note: 'B',
    significance: 'Back Of Head',
    gematria: 100,
    alchemy: 'Watery',
    intelligence:
      'The Intelligence of All the Activities of the Spiritual Being',
  },

  // Final Letters (diagonal lines through center)
  'Kaph-final': {
    letterChar: 'ך',
    letterName: 'Final Kaph',
    keyNumber: 10,
    keyName: 'Wheel of Fortune',
    association: { kind: 'planet', value: 'Jupiter' },
    color: 'Violet',
    colorValue: '#8B00FF',
    note: 'A#',
    significance: 'Closed Hand',
    gematria: 20,
    alchemy: 'Tin',
    intelligence: 'The Faithful Intelligence',
  },
  'Nun-final': {
    letterChar: 'ן',
    letterName: 'Final Nun',
    keyNumber: 13,
    keyName: 'Death',
    association: { kind: 'zodiac', value: 'Scorpio' },
    color: 'Blue-Green',
    colorValue: '#00CED1',
    note: 'G',
    significance: 'Fish',
    gematria: 50,
    alchemy: 'Watery',
    intelligence: 'The Imaginative Intelligence',
  },
  'Peh-final': {
    letterChar: 'ף',
    letterName: 'Final Peh',
    keyNumber: 16,
    keyName: 'The Tower',
    association: { kind: 'planet', value: 'Mars' },
    color: 'Red',
    colorValue: '#FF0000',
    note: 'C',
    significance: 'Mouth',
    gematria: 80,
    alchemy: 'Iron',
    intelligence: 'The Natural Intelligence',
  },
  'Tzaddi-final': {
    letterChar: 'ץ',
    letterName: 'Final Tzaddi',
    keyNumber: 17,
    keyName: 'The Star',
    association: { kind: 'zodiac', value: 'Aquarius' },
    color: 'Violet',
    colorValue: '#8B00FF',
    note: 'A#',
    significance: 'Fish-Hook',
    gematria: 90,
    alchemy: 'Airy',
    intelligence: 'The Intelligence of Meditation',
  },
  'Mem-final': {
    letterChar: 'ם',
    letterName: 'Final Mem',
    keyNumber: 12,
    keyName: 'The Hanged Man',
    association: { kind: 'element', value: 'Water' },
    color: 'Blue',
    colorValue: '#0000FF',
    note: 'G#',
    significance: 'Water',
    gematria: 40,
    alchemy: 'Water',
    intelligence: 'The Renewing Intelligence',
    outerPlanet: 'Neptune',
  },
};

export function getLabelPieces(letter: HebrewLetter): {
  title: string;
  subtitleText: string;
  hebrewChar: string;
  assocGlyph: string; // zodiac/planet/element symbol
} {
  const d = getSpec(letter);
  const assocGlyph = associationToGlyph(d.association);
  const assocName = d.association.value; // element/planet/zodiac label

  return {
    title: `Key ${d.keyNumber} – ${d.keyName}`,
    subtitleText: `${d.letterName} |${d.letterChar}| – ${assocName} ${assocGlyph}`,
    hebrewChar: d.letterChar,
    assocGlyph,
  };
}

/** Direct access to specs if you need more than the string. */
export function getSpec(letter: HebrewLetter): LetterSpec {
  // eslint-disable-next-line security/detect-object-injection -- letter is TypeScript-typed HebrewLetter, safe indexed access
  return S[letter];
}
