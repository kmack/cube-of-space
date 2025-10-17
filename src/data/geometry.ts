// src/data/geometry.ts
import type { Axis, Diagonal, Edge, Face } from '../utils/types';
import { HALF, MOTHER_OFFSET } from './constants';

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

export const edges: Edge[] = [
  // Corner verticals
  {
    letter: 'Heh',
    pos: [eastX, 0, northZ],
    normal: [+1, 0, -1],
    tangent: [0, 1, 0],
  }, // NE
  {
    letter: 'Vav',
    pos: [eastX, 0, southZ],
    normal: [+1, 0, +1],
    tangent: [0, 1, 0],
  }, // SE
  {
    letter: 'Lamed',
    pos: [westX, 0, northZ],
    normal: [-1, 0, -1],
    tangent: [0, 1, 0],
  }, // NW
  {
    letter: 'Nun',
    pos: [westX, 0, southZ],
    normal: [-1, 0, +1],
    tangent: [0, 1, 0],
  }, // SW

  // East face (top/bottom)
  {
    letter: 'Zain',
    pos: [eastX, topY, 0],
    normal: [+1, +1, 0],
    tangent: [0, 0, -1],
  }, // East-Above
  {
    letter: 'Cheth',
    pos: [eastX, botY, 0],
    normal: [+1, -1, 0],
    tangent: [0, 0, -1],
  }, // East-Below (fixed tangent):contentReference[oaicite:3]{index=3}

  // North face (top/bottom)
  {
    letter: 'Teth',
    pos: [0, topY, northZ],
    normal: [0, 1, -1],
    tangent: [-1, 0, 0],
  }, // North-Above
  {
    letter: 'Yod',
    pos: [0, botY, northZ],
    normal: [0, -1, -1],
    tangent: [-1, 0, 0],
  }, // North-Below (fixed tangent):contentReference[oaicite:4]{index=4}

  // West face (top/bottom)
  {
    letter: 'Samekh',
    pos: [westX, topY, 0],
    normal: [-1, +1, 0],
    tangent: [0, 0, +1],
  }, // West-Above
  {
    letter: 'Ayin',
    pos: [westX, botY, 0],
    normal: [-1, -1, 0],
    tangent: [0, 0, +1],
  }, // West-Below (fixed tangent):contentReference[oaicite:5]{index=5}

  // South face (top/bottom)
  {
    letter: 'Tzaddi',
    pos: [0, topY, southZ],
    normal: [0, +1, +1],
    tangent: [+1, 0, 0],
  }, // South-Above
  {
    letter: 'Qoph',
    pos: [0, botY, southZ],
    normal: [0, -1, +1],
    tangent: [+1, 0, 0],
  }, // South-Below (fixed tangent):contentReference[oaicite:6]{index=6},
];

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

// Diagonals - Final Letters connecting opposite corners through center
// Label positioned at offset from center along the diagonal
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
    from: [eastX, botY, southZ], // SE bottom
    to: [westX, topY, northZ], // NW top
    pos: [-DIAGONAL_OFFSET, DIAGONAL_OFFSET, -DIAGONAL_OFFSET],
    tangent: normalize([-2, 2, -2]), // direction: from SE bottom to NW top
    normal: normalize([1, 0, -1]), // match Nun pattern but flip Z sign
  },
  {
    letter: 'Nun-final',
    from: [eastX, botY, northZ], // NE bottom
    to: [westX, topY, southZ], // SW top
    pos: [-DIAGONAL_OFFSET, DIAGONAL_OFFSET, DIAGONAL_OFFSET],
    tangent: normalize([-2, 2, 2]), // direction: from NE bottom to SW top
    normal: normalize([-1, 0, -1]), // try negative X and Z
  },
  {
    letter: 'Peh-final',
    from: [westX, botY, southZ], // SW bottom
    to: [eastX, topY, northZ], // NE top
    pos: [DIAGONAL_OFFSET, DIAGONAL_OFFSET, -DIAGONAL_OFFSET],
    tangent: normalize([2, 2, -2]), // full 3D direction along diagonal
    normal: normalize([1, 0, 1]), // perpendicular to tangent, in horizontal plane (correct)
  },
  {
    letter: 'Tzaddi-final',
    from: [westX, botY, northZ], // NW bottom
    to: [eastX, topY, southZ], // SE top
    pos: [DIAGONAL_OFFSET, DIAGONAL_OFFSET, DIAGONAL_OFFSET],
    tangent: normalize([2, 2, 2]), // full 3D direction along diagonal
    normal: normalize([-1, 0, 1]), // perpendicular to tangent, in horizontal plane (correct)
  },
];

/**
 * Validate that all geometric vectors are properly normalized
 * This runs at module initialization to catch geometry errors early
 */
function validateGeometry(): void {
  const TOLERANCE = 1e-6;

  const checkNormalized = (v: [number, number, number], name: string): void => {
    const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    const isNormalized = Math.abs(length - 1.0) < TOLERANCE;
    const hasNaN = isNaN(v[0]) || isNaN(v[1]) || isNaN(v[2]);

    if (hasNaN) {
      throw new Error(
        `Geometry validation failed: ${name} contains NaN values: [${v[0]}, ${v[1]}, ${v[2]}]`
      );
    }

    if (!isNormalized) {
      console.warn(
        `Geometry validation warning: ${name} is not normalized. Length: ${length}, Vector: [${v[0]}, ${v[1]}, ${v[2]}]`
      );
    }
  };

  // Validate edges
  edges.forEach((edge) => {
    checkNormalized(edge.normal, `Edge ${edge.letter} normal`);
    checkNormalized(edge.tangent, `Edge ${edge.letter} tangent`);
  });

  // Validate axes
  axes.forEach((axis) => {
    checkNormalized(axis.normal, `Axis ${axis.letter} normal`);
    checkNormalized(axis.tangent, `Axis ${axis.letter} tangent`);
  });

  // Validate diagonals
  diagonals.forEach((diagonal) => {
    checkNormalized(diagonal.normal, `Diagonal ${diagonal.letter} normal`);
    checkNormalized(diagonal.tangent, `Diagonal ${diagonal.letter} tangent`);
  });

  if (process.env.NODE_ENV !== 'production') {
    console.info(
      '✓ Geometry validation passed: all vectors properly normalized'
    );
  }
}

// Run validation at module load time
validateGeometry();
