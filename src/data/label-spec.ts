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

export type LetterSpec = {
  letterChar: string; // Hebrew glyph as a single char (or image elsewhere)
  letterName: HebrewLetter; // English name
  keyNumber: number; // Tarot Major Arcana number (0..21 in B.O.T.A. scheme)
  keyName: string; // Tarot Key title
  association: Assoc; // Element / planet / zodiac
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

// ————————————
// Canonical attributions (B.O.T.A. / Golden Dawn):
// Mothers (elements), Doubles (planets), Simples (zodiac)
// ————————————

const S: Record<HebrewLetter, LetterSpec> = {
  // Mothers
  Aleph: {
    letterChar: 'א',
    letterName: 'Aleph',
    keyNumber: 0,
    keyName: 'The Fool',
    association: { kind: 'element', value: 'Air' },
  },
  Mem: {
    letterChar: 'מ',
    letterName: 'Mem',
    keyNumber: 12,
    keyName: 'The Hanged Man',
    association: { kind: 'element', value: 'Water' },
  },
  Shin: {
    letterChar: 'ש',
    letterName: 'Shin',
    keyNumber: 20,
    keyName: 'Judgement',
    association: { kind: 'element', value: 'Fire' },
  },

  // Doubles (planets)
  Beth: {
    letterChar: 'ב',
    letterName: 'Beth',
    keyNumber: 1,
    keyName: 'The Magician',
    association: { kind: 'planet', value: 'Mercury' },
  },
  Gimel: {
    letterChar: 'ג',
    letterName: 'Gimel',
    keyNumber: 2,
    keyName: 'The High Priestess',
    association: { kind: 'planet', value: 'Moon' },
  },
  Daleth: {
    letterChar: 'ד',
    letterName: 'Daleth',
    keyNumber: 3,
    keyName: 'The Empress',
    association: { kind: 'planet', value: 'Venus' },
  },
  Kaph: {
    letterChar: 'כ',
    letterName: 'Kaph',
    keyNumber: 10,
    keyName: 'Wheel of Fortune',
    association: { kind: 'planet', value: 'Jupiter' },
  },
  Peh: {
    letterChar: 'פ',
    letterName: 'Peh',
    keyNumber: 16,
    keyName: 'The Tower',
    association: { kind: 'planet', value: 'Mars' },
  },
  Resh: {
    letterChar: 'ר',
    letterName: 'Resh',
    keyNumber: 19,
    keyName: 'The Sun',
    association: { kind: 'planet', value: 'Sun' },
  },
  Tav: {
    letterChar: 'ת',
    letterName: 'Tav',
    keyNumber: 21,
    keyName: 'The World',
    association: { kind: 'planet', value: 'Saturn' },
  },

  // Simples (zodiac)
  Heh: {
    letterChar: 'ה',
    letterName: 'Heh',
    keyNumber: 4,
    keyName: 'The Emperor',
    association: { kind: 'zodiac', value: 'Aries' },
  },
  Vav: {
    letterChar: 'ו',
    letterName: 'Vav',
    keyNumber: 5,
    keyName: 'The Hierophant',
    association: { kind: 'zodiac', value: 'Taurus' },
  },
  Zain: {
    letterChar: 'ז',
    letterName: 'Zain',
    keyNumber: 6,
    keyName: 'The Lovers',
    association: { kind: 'zodiac', value: 'Gemini' },
  },
  Cheth: {
    letterChar: 'ח',
    letterName: 'Cheth',
    keyNumber: 7,
    keyName: 'The Chariot',
    association: { kind: 'zodiac', value: 'Cancer' },
  },
  Teth: {
    letterChar: 'ט',
    letterName: 'Teth',
    keyNumber: 8,
    keyName: 'Strength',
    association: { kind: 'zodiac', value: 'Leo' },
  },
  Yod: {
    letterChar: 'י',
    letterName: 'Yod',
    keyNumber: 9,
    keyName: 'The Hermit',
    association: { kind: 'zodiac', value: 'Virgo' },
  },
  Lamed: {
    letterChar: 'ל',
    letterName: 'Lamed',
    keyNumber: 11,
    keyName: 'Justice',
    association: { kind: 'zodiac', value: 'Libra' },
  },
  Nun: {
    letterChar: 'נ',
    letterName: 'Nun',
    keyNumber: 13,
    keyName: 'Death',
    association: { kind: 'zodiac', value: 'Scorpio' },
  },
  Samekh: {
    letterChar: 'ס',
    letterName: 'Samekh',
    keyNumber: 14,
    keyName: 'Temperance',
    association: { kind: 'zodiac', value: 'Sagittarius' },
  },
  Ayin: {
    letterChar: 'ע',
    letterName: 'Ayin',
    keyNumber: 15,
    keyName: 'The Devil',
    association: { kind: 'zodiac', value: 'Capricorn' },
  },
  Tzaddi: {
    letterChar: 'צ',
    letterName: 'Tzaddi',
    keyNumber: 17,
    keyName: 'The Star',
    association: { kind: 'zodiac', value: 'Aquarius' },
  },
  Qoph: {
    letterChar: 'ק',
    letterName: 'Qoph',
    keyNumber: 18,
    keyName: 'The Moon',
    association: { kind: 'zodiac', value: 'Pisces' },
  },

  // Final Letters (diagonal lines through center)
  'Kaph-final': {
    letterChar: 'ך',
    letterName: 'Kaph-final',
    keyNumber: 10,
    keyName: 'Wheel of Fortune',
    association: { kind: 'planet', value: 'Jupiter' },
  },
  'Nun-final': {
    letterChar: 'ן',
    letterName: 'Nun-final',
    keyNumber: 13,
    keyName: 'Death',
    association: { kind: 'zodiac', value: 'Scorpio' },
  },
  'Peh-final': {
    letterChar: 'ף',
    letterName: 'Peh-final',
    keyNumber: 16,
    keyName: 'The Tower',
    association: { kind: 'planet', value: 'Mars' },
  },
  'Tzaddi-final': {
    letterChar: 'ץ',
    letterName: 'Tzaddi-final',
    keyNumber: 17,
    keyName: 'The Star',
    association: { kind: 'zodiac', value: 'Aquarius' },
  },
  'Mem-final': {
    letterChar: 'ם',
    letterName: 'Mem-final',
    keyNumber: 12,
    keyName: 'The Hanged Man',
    association: { kind: 'element', value: 'Water' },
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
  return S[letter];
}
