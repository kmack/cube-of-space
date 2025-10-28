/**
 * @fileoverview Cube of Space geometry definitions including faces, edges, axes,
 * and diagonals with precise 3D positioning and Hebrew letter associations.
 *
 * GEOMETRY STRUCTURE:
 * - Faces (6): The six cube faces representing Double Letters (planetary)
 * - Edges (12): The twelve cube edges representing Simple Letters (zodiacal)
 * - Axes (3): The three axes through the cube center representing Mother Letters (elemental)
 * - Diagonals (4): The four space diagonals through opposite corners representing Final Letters
 * - Center (1): The cube center representing Tav/Saturn/The World
 *
 * COORDINATE SYSTEM:
 * - X-axis: East (+) / West (-)
 * - Y-axis: Above (+) / Below (-)
 * - Z-axis: South (+) / North (-)
 * - Origin: Cube center at [0, 0, 0]
 * - Size: Cube extends ±HALF units from origin
 *
 * VECTOR CONVENTIONS:
 * - normal: Direction perpendicular to the surface (for label orientation)
 * - tangent: Direction along the edge/axis (for text baseline)
 * - All normal and tangent vectors are normalized to unit length
 */

// src/data/geometry.ts
import { GeometryValidationService } from '../utils/geometry-validation';
import type { Axis, Diagonal, Edge, Face } from '../utils/types';
import { HALF, MOTHER_OFFSET } from './constants';

// =============================================================================
// FACES - Six cube faces (Double Letters / Planetary)
// =============================================================================

export const faces: Face[] = [
  { letter: 'Beth', pos: [0, +HALF, 0], rotation: [-Math.PI / 2, 0, 0] }, // Above (Mercury)
  { letter: 'Gimel', pos: [0, -HALF, 0], rotation: [Math.PI / 2, 0, 0] }, // Below (Moon)
  { letter: 'Daleth', pos: [+HALF, 0, 0], rotation: [0, Math.PI / 2, 0] }, // East (Venus)
  { letter: 'Kaph', pos: [-HALF, 0, 0], rotation: [0, -Math.PI / 2, 0] }, // West (Jupiter)
  { letter: 'Resh', pos: [0, 0, +HALF], rotation: [0, 0, 0] }, // South (Sun)
  { letter: 'Peh', pos: [0, 0, -HALF], rotation: [0, Math.PI, 0] }, // North (Mars)
];

export const center: Face = {
  letter: 'Tav',
  pos: [0, 0, 0],
  rotation: [0, 0, 0], // Saturn
};

const topY = +HALF;
const botY = -HALF;

const eastX = +HALF;
const westX = -HALF;

const southZ = +HALF;
const northZ = -HALF;

// Helper constant for edge normals at 45-degree angles (1/√2 ≈ 0.707)
const INV_SQRT2 = 1 / Math.sqrt(2);

// =============================================================================
// EDGES - Twelve cube edges (Simple Letters / Zodiacal)
// =============================================================================

export const edges: Edge[] = [
  // Four vertical edges at the cube corners
  {
    letter: 'Heh',
    pos: [eastX, 0, northZ],
    normal: [INV_SQRT2, 0, -INV_SQRT2],
    tangent: [0, 1, 0],
  }, // NE
  {
    letter: 'Vav',
    pos: [eastX, 0, southZ],
    normal: [INV_SQRT2, 0, INV_SQRT2],
    tangent: [0, 1, 0],
  }, // SE
  {
    letter: 'Lamed',
    pos: [westX, 0, northZ],
    normal: [-INV_SQRT2, 0, -INV_SQRT2],
    tangent: [0, 1, 0],
  }, // NW
  {
    letter: 'Nun',
    pos: [westX, 0, southZ],
    normal: [-INV_SQRT2, 0, INV_SQRT2],
    tangent: [0, 1, 0],
  }, // SW

  // East face edges (top/bottom horizontal edges)
  // Tangent points north-to-south along the edge
  {
    letter: 'Zain',
    pos: [eastX, topY, 0],
    normal: [INV_SQRT2, INV_SQRT2, 0],
    tangent: [0, 0, -1], // Points from south to north
  },
  {
    letter: 'Cheth',
    pos: [eastX, botY, 0],
    normal: [INV_SQRT2, -INV_SQRT2, 0],
    tangent: [0, 0, -1], // Points from south to north
  },

  // North face edges (top/bottom horizontal edges)
  // Tangent points west-to-east along the edge
  {
    letter: 'Teth',
    pos: [0, topY, northZ],
    normal: [0, INV_SQRT2, -INV_SQRT2],
    tangent: [-1, 0, 0], // Points from east to west
  },
  {
    letter: 'Yod',
    pos: [0, botY, northZ],
    normal: [0, -INV_SQRT2, -INV_SQRT2],
    tangent: [-1, 0, 0], // Points from east to west
  },

  // West face edges (top/bottom horizontal edges)
  // Tangent points south-to-north along the edge
  {
    letter: 'Samekh',
    pos: [westX, topY, 0],
    normal: [-INV_SQRT2, INV_SQRT2, 0],
    tangent: [0, 0, +1], // Points from north to south
  },
  {
    letter: 'Ayin',
    pos: [westX, botY, 0],
    normal: [-INV_SQRT2, -INV_SQRT2, 0],
    tangent: [0, 0, +1], // Points from north to south
  },

  // South face edges (top/bottom horizontal edges)
  // Tangent points east-to-west along the edge
  {
    letter: 'Tzaddi',
    pos: [0, topY, southZ],
    normal: [0, INV_SQRT2, INV_SQRT2],
    tangent: [+1, 0, 0], // Points from west to east
  },
  {
    letter: 'Qoph',
    pos: [0, botY, southZ],
    normal: [0, -INV_SQRT2, INV_SQRT2],
    tangent: [+1, 0, 0], // Points from west to east
  },
];

// =============================================================================
// AXES - Three orthogonal axes (Mother Letters / Elemental)
// =============================================================================

export const axes: Axis[] = [
  {
    letter: 'Aleph',
    from: [0, -HALF, 0],
    to: [0, +HALF, 0],
    pos: [0, MOTHER_OFFSET, 0],
    tangent: [0, 1, 0],
    normal: [0, 0, 1],
  },
  {
    letter: 'Mem',
    from: [-HALF, 0, 0],
    to: [+HALF, 0, 0],
    pos: [MOTHER_OFFSET, 0, 0],
    tangent: [1, 0, 0],
    normal: [0, 1, 0],
  },
  {
    letter: 'Shin',
    from: [0, 0, -HALF],
    to: [0, 0, +HALF],
    pos: [0, 0, MOTHER_OFFSET],
    tangent: [0, 0, 1],
    normal: [0, 1, 0],
  },
];

// =============================================================================
// DIAGONALS - Four space diagonals (Final Letters)
// =============================================================================
// These connect opposite corners through the cube center
// Labels are positioned at DIAGONAL_OFFSET distance from center along each diagonal

const DIAGONAL_OFFSET = 0.6;

/**
 * Normalize a 3D vector to unit length
 * @param v - Input vector [x, y, z]
 * @returns Normalized vector with length 1, or safe fallback [0, 0, 1] for zero-length vectors
 * @throws Error if vector length is zero (in development mode)
 */
const normalize = (v: [number, number, number]): [number, number, number] => {
  const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);

  // Epsilon for floating-point comparison (prevents division by near-zero)
  const EPSILON = 1e-10;

  if (len < EPSILON) {
    // In development, throw error for immediate debugging
    if (process.env.NODE_ENV !== 'production') {
      console.error(
        `Cannot normalize zero-length vector: [${v[0]}, ${v[1]}, ${v[2]}]`
      );
      throw new Error(
        `Vector normalization failed: zero-length vector [${v[0]}, ${v[1]}, ${v[2]}]`
      );
    }

    // In production, log warning and return safe fallback
    console.warn(
      `Normalizing zero-length vector [${v[0]}, ${v[1]}, ${v[2]}], using fallback [0, 0, 1]`
    );
    return [0, 0, 1]; // Safe default pointing along positive Z-axis
  }

  return [v[0] / len, v[1] / len, v[2] / len];
};

export const diagonals: Diagonal[] = [
  {
    letter: 'Kaph-final',
    from: [eastX, botY, southZ], // SE bottom corner
    to: [westX, topY, northZ], // NW top corner
    pos: [-DIAGONAL_OFFSET, DIAGONAL_OFFSET, -DIAGONAL_OFFSET],
    tangent: normalize([-2, 2, -2]), // Direction vector along the diagonal
    normal: normalize([1, 0, -1]), // Perpendicular direction for label orientation
  },
  {
    letter: 'Nun-final',
    from: [eastX, botY, northZ], // NE bottom corner
    to: [westX, topY, southZ], // SW top corner
    pos: [-DIAGONAL_OFFSET, DIAGONAL_OFFSET, DIAGONAL_OFFSET],
    tangent: normalize([-2, 2, 2]), // Direction vector along the diagonal
    normal: normalize([-1, 0, -1]), // Perpendicular direction for label orientation
  },
  {
    letter: 'Peh-final',
    from: [westX, botY, southZ], // SW bottom corner
    to: [eastX, topY, northZ], // NE top corner
    pos: [DIAGONAL_OFFSET, DIAGONAL_OFFSET, -DIAGONAL_OFFSET],
    tangent: normalize([2, 2, -2]), // Direction vector along the diagonal
    normal: normalize([1, 0, 1]), // Perpendicular direction in horizontal plane for label orientation
  },
  {
    letter: 'Tzaddi-final',
    from: [westX, botY, northZ], // NW bottom corner
    to: [eastX, topY, southZ], // SE top corner
    pos: [DIAGONAL_OFFSET, DIAGONAL_OFFSET, DIAGONAL_OFFSET],
    tangent: normalize([2, 2, 2]), // Direction vector along the diagonal
    normal: normalize([-1, 0, 1]), // Perpendicular direction in horizontal plane for label orientation
  },
];

// Run validation at module load time using the validation service
// This catches geometry errors early during development
GeometryValidationService.validateGeometryOrThrow(edges, axes, diagonals);
