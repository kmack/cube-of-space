// src/label-spec.ts
export type HebrewLetter =
  | "Aleph"
  | "Beth"
  | "Gimel"
  | "Daleth"
  | "Heh"
  | "Vav"
  | "Zain"
  | "Cheth"
  | "Teth"
  | "Yod"
  | "Kaph"
  | "Lamed"
  | "Mem"
  | "Nun"
  | "Samekh"
  | "Ayin"
  | "Peh"
  | "Tzaddi"
  | "Qoph"
  | "Resh"
  | "Shin"
  | "Tav";

type Assoc =
  | { kind: "element"; value: "Air" | "Water" | "Fire" }
  | {
      kind: "planet";
      value:
        | "Saturn"
        | "Jupiter"
        | "Mars"
        | "Sun"
        | "Venus"
        | "Mercury"
        | "Moon";
    }
  | {
      kind: "zodiac";
      value:
        | "Aries"
        | "Taurus"
        | "Gemini"
        | "Cancer"
        | "Leo"
        | "Virgo"
        | "Libra"
        | "Scorpio"
        | "Sagittarius"
        | "Capricorn"
        | "Aquarius"
        | "Pisces";
    };

export type LetterSpec = {
  letterChar: string; // Hebrew glyph as a single char (or image elsewhere)
  letterName: HebrewLetter; // English name
  keyNumber: number; // Tarot Major Arcana number (0..21 in B.O.T.A. scheme)
  keyName: string; // Tarot Key title
  association: Assoc; // Element / planet / zodiac
};

// ————————————
// Canonical attributions (B.O.T.A. / Golden Dawn):
// Mothers (elements), Doubles (planets), Simples (zodiac)
// ————————————

const S: Record<HebrewLetter, LetterSpec> = {
  // Mothers
  Aleph: {
    letterChar: "א",
    letterName: "Aleph",
    keyNumber: 0,
    keyName: "The Fool",
    association: { kind: "element", value: "Air" },
  },
  Mem: {
    letterChar: "מ",
    letterName: "Mem",
    keyNumber: 12,
    keyName: "The Hanged Man",
    association: { kind: "element", value: "Water" },
  },
  Shin: {
    letterChar: "ש",
    letterName: "Shin",
    keyNumber: 20,
    keyName: "Judgement",
    association: { kind: "element", value: "Fire" },
  },

  // Doubles (planets)
  Beth: {
    letterChar: "ב",
    letterName: "Beth",
    keyNumber: 1,
    keyName: "The Magician",
    association: { kind: "planet", value: "Mercury" },
  },
  Gimel: {
    letterChar: "ג",
    letterName: "Gimel",
    keyNumber: 2,
    keyName: "The High Priestess",
    association: { kind: "planet", value: "Moon" },
  },
  Daleth: {
    letterChar: "ד",
    letterName: "Daleth",
    keyNumber: 3,
    keyName: "The Empress",
    association: { kind: "planet", value: "Venus" },
  },
  Kaph: {
    letterChar: "כ",
    letterName: "Kaph",
    keyNumber: 10,
    keyName: "Wheel of Fortune",
    association: { kind: "planet", value: "Jupiter" },
  },
  Peh: {
    letterChar: "פ",
    letterName: "Peh",
    keyNumber: 16,
    keyName: "The Tower",
    association: { kind: "planet", value: "Mars" },
  },
  Resh: {
    letterChar: "ר",
    letterName: "Resh",
    keyNumber: 19,
    keyName: "The Sun",
    association: { kind: "planet", value: "Sun" },
  },
  Tav: {
    letterChar: "ת",
    letterName: "Tav",
    keyNumber: 21,
    keyName: "The World",
    association: { kind: "planet", value: "Saturn" },
  },

  // Simples (zodiac)
  Heh: {
    letterChar: "ה",
    letterName: "Heh",
    keyNumber: 4,
    keyName: "The Emperor",
    association: { kind: "zodiac", value: "Aries" },
  },
  Vav: {
    letterChar: "ו",
    letterName: "Vav",
    keyNumber: 5,
    keyName: "The Hierophant",
    association: { kind: "zodiac", value: "Taurus" },
  },
  Zain: {
    letterChar: "ז",
    letterName: "Zain",
    keyNumber: 6,
    keyName: "The Lovers",
    association: { kind: "zodiac", value: "Gemini" },
  },
  Cheth: {
    letterChar: "ח",
    letterName: "Cheth",
    keyNumber: 7,
    keyName: "The Chariot",
    association: { kind: "zodiac", value: "Cancer" },
  },
  Teth: {
    letterChar: "ט",
    letterName: "Teth",
    keyNumber: 8,
    keyName: "Strength",
    association: { kind: "zodiac", value: "Leo" },
  },
  Yod: {
    letterChar: "י",
    letterName: "Yod",
    keyNumber: 9,
    keyName: "The Hermit",
    association: { kind: "zodiac", value: "Virgo" },
  },
  Lamed: {
    letterChar: "ל",
    letterName: "Lamed",
    keyNumber: 11,
    keyName: "Justice",
    association: { kind: "zodiac", value: "Libra" },
  },
  Nun: {
    letterChar: "נ",
    letterName: "Nun",
    keyNumber: 13,
    keyName: "Death",
    association: { kind: "zodiac", value: "Scorpio" },
  },
  Samekh: {
    letterChar: "ס",
    letterName: "Samekh",
    keyNumber: 14,
    keyName: "Temperance",
    association: { kind: "zodiac", value: "Sagittarius" },
  },
  Ayin: {
    letterChar: "ע",
    letterName: "Ayin",
    keyNumber: 15,
    keyName: "The Devil",
    association: { kind: "zodiac", value: "Capricorn" },
  },
  Tzaddi: {
    letterChar: "צ",
    letterName: "Tzaddi",
    keyNumber: 17,
    keyName: "The Star",
    association: { kind: "zodiac", value: "Aquarius" },
  },
  Qoph: {
    letterChar: "ק",
    letterName: "Qoph",
    keyNumber: 18,
    keyName: "The Moon",
    association: { kind: "zodiac", value: "Pisces" },
  },
};

/** Return the 3-line standardized label. */
export function formatLabel(letter: HebrewLetter): string {
  const d = S[letter];
  const assoc =
    d.association.kind === "element"
      ? d.association.value
      : d.association.kind === "planet"
      ? d.association.value
      : d.association.value; // zodiac
  return `Key ${d.keyNumber} – ${d.keyName}\n${d.letterName} |${d.letterChar}|  - ${assoc}`;
}

/** Direct access to specs if you need more than the string. */
export function getSpec(letter: HebrewLetter): LetterSpec {
  return S[letter];
}
