// src/utils/tarot-images.ts

// Map Tarot key numbers to image filenames
const TAROT_IMAGE_MAP: Record<number, string> = {
  0: '00-the-fool.png',
  1: '01-the-magician.png',
  2: '02-the-high-priestess.png',
  3: '03-the-empress.png',
  4: '04-the-emperor.png',
  5: '05-the-hierophant.png',
  6: '06-the-lovers.png',
  7: '07-the-chariot.png',
  8: '08-strength.png',
  9: '09-the-hermit.png',
  10: '10-wheel-of-fortune.png',
  11: '11-justice.png',
  12: '12-hanged-man.png',
  13: '13-death.png',
  14: '14-temperance.png',
  15: '15-the-devil.png',
  16: '16-the-tower.png',
  17: '17-the-star.png',
  18: '18-the-moon.png',
  19: '19-the-sun.png',
  20: '20-judgement.png',
  21: '21-the-world.png',
};

/**
 * Get the image path for a Tarot key number
 */
export function getTarotImagePath(keyNumber: number): string {
  const filename = TAROT_IMAGE_MAP[keyNumber];
  if (!filename) {
    throw new Error(`No Tarot image found for key number: ${keyNumber}`);
  }
  return `/images/major-arcana/${filename}`;
}

/**
 * Check if a Tarot image exists for the given key number
 */
export function hasTarotImage(keyNumber: number): boolean {
  return keyNumber in TAROT_IMAGE_MAP;
}