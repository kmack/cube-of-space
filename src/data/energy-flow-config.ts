// src/data/energy-flow-config.ts
import type { HebrewLetter } from './label-spec';

export type FlowDirection = 'positive' | 'negative';

// Hebrew letters that appear on cube edges (not faces or axes)
export type EdgeHebrewLetter = Extract<
  HebrewLetter,
  | 'Heh'
  | 'Vav'
  | 'Lamed'
  | 'Nun' // Corner verticals
  | 'Zain'
  | 'Cheth'
  | 'Teth'
  | 'Yod' // Face edges (East/North)
  | 'Samekh'
  | 'Ayin'
  | 'Tzaddi'
  | 'Qoph' // Face edges (West/South)
>;

/**
 * Cube position descriptions for better debugging.
 */
export type EdgePosition =
  | 'Northeastern Edge'
  | 'Southeastern Edge'
  | 'Northwestern Edge'
  | 'Southwestern Edge'
  | 'East Above Edge'
  | 'East Below Edge'
  | 'North Above Edge'
  | 'North Below Edge'
  | 'West Above Edge'
  | 'West Below Edge'
  | 'South Above Edge'
  | 'South Below Edge';

/**
 * Energy flow configuration with enhanced metadata.
 */
export interface EnergyFlowDefinition {
  readonly direction: FlowDirection;
  readonly color: string;
  readonly reasoning: string;
  readonly position: EdgePosition;
}

/**
 * Reasoning behind energy flow directions based on mystical and geometric principles.
 * Documents the spiritual/esoteric logic for each edge's directional energy flow.
 */
const FLOW_REASONING: Record<EdgeHebrewLetter, string> = {
  // Corner vertical flows - alternating pattern for energy circulation
  Heh: 'Northeast corner: Aries energy descends (Above to Below)',
  Vav: 'Southeast corner: Taurus energy ascends (Below to Above)',
  Lamed: 'Northwest corner: Libra energy descends (Above to Below)',
  Nun: 'Southwest corner: Scorpio energy ascends (Below to Above)',

  // East face flows - solar energy circulation
  Zain: 'East Above: Gemini energy flows South to North (against tangent)',
  Cheth: 'East Below: Cancer energy flows North to South (with tangent)',

  // North face flows - mental/air energy (both eastward to westward)
  Teth: 'North Above: Leo energy flows East to West (against tangent)',
  Yod: 'North Below: Virgo energy flows East to West (against tangent)',

  // West face flows - lunar/passive energy (both northward to southward)
  Samekh: 'West Above: Sagittarius energy flows North to South (with tangent)',
  Ayin: 'West Below: Capricorn energy flows North to South (with tangent)',

  // South face flows - fire/emotional energy (both westward to eastward)
  Tzaddi: 'South Above: Aquarius energy flows West to East (with tangent)',
  Qoph: 'South Below: Pisces energy flows West to East (with tangent)',
};

/**
 * Energy flow directions for each Hebrew letter edge.
 * Based on mystical correspondences and geometric flow patterns.
 *
 * - 'positive': Flow in the direction of the edge's tangent vector
 * - 'negative': Flow opposite to the edge's tangent vector
 */
const FLOW_DIRECTIONS: Record<EdgeHebrewLetter, FlowDirection> = {
  // Corner verticals - alternating ascent/descent pattern
  Heh: 'negative', // NE - Above to Below (downward)
  Vav: 'positive', // SE - Below to Above (upward)
  Lamed: 'negative', // NW - Above to Below (downward)
  Nun: 'positive', // SW - Below to Above (upward)

  // Face edges - horizontal flows creating circulation patterns
  Zain: 'negative', // East Above - South to North (against Z tangent [0,0,-1])
  Cheth: 'positive', // East Below - North to South (with Z tangent [0,0,-1])

  Teth: 'negative', // North Above - East to West (against X tangent [-1,0,0])
  Yod: 'negative', // North Below - East to West (against X tangent [-1,0,0])

  Samekh: 'positive', // West Above - North to South (with Z tangent [0,0,+1])
  Ayin: 'positive', // West Below - North to South (with Z tangent [0,0,+1])

  Tzaddi: 'positive', // South Above - West to East (with X tangent [+1,0,0])
  Qoph: 'positive', // South Below - West to East (with X tangent [+1,0,0])
};

/**
 * Energy flow colors based on Hebrew letter dimensional correspondences.
 * Colors follow traditional mystical color attributions for each letter's
 * position and astrological/elemental associations.
 */
const FLOW_COLORS: Record<EdgeHebrewLetter, string> = {
  // Corner verticals - based on cardinal/fixed signs
  Heh: '#ff0000', // Red (Aries - Cardinal Fire)
  Vav: '#ff4500', // Red-Orange (Taurus - Fixed Earth)
  Lamed: '#00ff00', // Green (Libra - Cardinal Air)
  Nun: '#00ffaa', // Blue-Green (Scorpio - Fixed Water)

  // East face - solar/active energies (warm spectrum)
  Zain: '#ffa500', // Orange (Gemini - Mutable Air)
  Cheth: '#ffcc00', // Yellow-Orange (Cancer - Cardinal Water)

  // North face - mental/air energies (yellow spectrum)
  Teth: '#ffff00', // Yellow (Leo - Fixed Fire)
  Yod: '#aaff00', // Yellow-Green (Virgo - Mutable Earth)

  // West face - lunar/passive energies (cool spectrum)
  Samekh: '#0000ff', // Blue (Sagittarius - Mutable Fire)
  Ayin: '#4400ff', // Blue-Violet (Capricorn - Cardinal Earth)

  // South face - fire/emotional energies (violet-red spectrum)
  Tzaddi: '#8800ff', // Violet (Aquarius - Fixed Air)
  Qoph: '#ff00aa', // Red-Violet (Pisces - Mutable Water)
};

/**
 * Centralized energy flow configuration for the Cube of Space.
 * Provides all flow directions, colors, and reasoning in one location.
 */
export const ENERGY_FLOW_CONFIG = {
  /**
   * Get the flow direction for a given Hebrew letter edge.
   */
  getDirection: (letter: EdgeHebrewLetter): FlowDirection =>
    // eslint-disable-next-line security/detect-object-injection -- letter is TypeScript-typed EdgeHebrewLetter, safe indexed access
    FLOW_DIRECTIONS[letter],

  /**
   * Get the energy color for a given Hebrew letter edge.
   */
  getColor: (letter: EdgeHebrewLetter): string =>
    // eslint-disable-next-line security/detect-object-injection -- letter is TypeScript-typed EdgeHebrewLetter, safe indexed access
    FLOW_COLORS[letter],

  /**
   * Get the mystical/geometric reasoning for a given Hebrew letter's flow direction.
   */
  getReason: (letter: EdgeHebrewLetter): string =>
    // eslint-disable-next-line security/detect-object-injection -- letter is TypeScript-typed EdgeHebrewLetter, safe indexed access
    FLOW_REASONING[letter],

  /**
   * Get all edge letters that have energy flows.
   */
  getAllEdgeLetters: (): EdgeHebrewLetter[] =>
    Object.keys(FLOW_DIRECTIONS) as EdgeHebrewLetter[],

  /**
   * Check if a Hebrew letter has an associated energy flow.
   */
  hasEnergyFlow: (letter: HebrewLetter): letter is EdgeHebrewLetter =>
    letter in FLOW_DIRECTIONS,

  // Export the raw data for advanced usage
  directions: FLOW_DIRECTIONS,
  colors: FLOW_COLORS,
  reasoning: FLOW_REASONING,
} as const;
