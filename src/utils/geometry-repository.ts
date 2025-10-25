// src/utils/geometry-repository.ts

import { axes, center, diagonals, edges, faces } from '../data/geometry';
import type { HebrewLetter } from '../data/label-spec';
import type { Axis, Diagonal, Edge, Face } from './types';

/**
 * Hebrew letters that appear on cube faces (Double letters - planetary)
 */
export type FaceHebrewLetter = Extract<
  HebrewLetter,
  'Beth' | 'Gimel' | 'Daleth' | 'Kaph' | 'Peh' | 'Resh'
>;

/**
 * Hebrew letters that appear on cube edges (Simple letters - zodiacal)
 */
export type EdgeHebrewLetter = Extract<
  HebrewLetter,
  | 'Heh'
  | 'Vav'
  | 'Zain'
  | 'Cheth'
  | 'Teth'
  | 'Yod'
  | 'Lamed'
  | 'Nun'
  | 'Samekh'
  | 'Ayin'
  | 'Tzaddi'
  | 'Qoph'
>;

/**
 * Hebrew letters that appear on cube axes (Mother letters - elemental)
 */
export type AxisHebrewLetter = Extract<HebrewLetter, 'Aleph' | 'Mem' | 'Shin'>;

/**
 * Hebrew letters that appear on cube diagonals
 */
export type DiagonalHebrewLetter = Extract<
  HebrewLetter,
  'Heh' | 'Vav' | 'Lamed' | 'Nun'
>;

/**
 * Hebrew letter at the center of the cube
 */
export type CenterHebrewLetter = Extract<HebrewLetter, 'Tav'>;

/**
 * Result type for geometry lookups
 */
export type GeometryLookupResult<T> =
  | { found: true; element: T }
  | { found: false; element: undefined };

/**
 * Type-safe geometry repository for the Cube of Space.
 *
 * Provides type-safe accessor methods for all geometric elements,
 * eliminating the need for array lookups and find operations.
 *
 * Benefits:
 * - Type safety: Compile-time checking of Hebrew letter types
 * - Performance: O(1) lookups via Map instead of O(n) array searches
 * - Reliability: Guaranteed existence checks with proper return types
 * - Developer experience: Autocomplete and type inference
 */
export class GeometryRepository {
  // Internal Maps for O(1) lookups
  private static readonly faceMap = new Map<FaceHebrewLetter, Face>(
    faces.map((f) => [f.letter as FaceHebrewLetter, f])
  );

  private static readonly edgeMap = new Map<EdgeHebrewLetter, Edge>(
    edges.map((e) => [e.letter as EdgeHebrewLetter, e])
  );

  private static readonly axisMap = new Map<AxisHebrewLetter, Axis>(
    axes.map((a) => [a.letter as AxisHebrewLetter, a])
  );

  private static readonly diagonalMap = new Map<DiagonalHebrewLetter, Diagonal>(
    diagonals.map((d) => [d.letter as DiagonalHebrewLetter, d])
  );

  // ============================================================
  // Face Accessors
  // ============================================================

  /**
   * Get a face by its Hebrew letter (type-safe).
   * Returns undefined if the letter doesn't correspond to a face.
   */
  static getFace(letter: FaceHebrewLetter): Face | undefined {
    return this.faceMap.get(letter);
  }

  /**
   * Get a face by its Hebrew letter with existence check.
   */
  static findFace(letter: FaceHebrewLetter): GeometryLookupResult<Face> {
    const element = this.faceMap.get(letter);
    if (element) {
      return { found: true, element };
    }
    return { found: false, element: undefined };
  }

  /**
   * Get all faces (immutable array).
   */
  static getAllFaces(): readonly Face[] {
    return faces;
  }

  /**
   * Get the center point.
   */
  static getCenter(): Face {
    return center;
  }

  /**
   * Check if a Hebrew letter corresponds to a face.
   */
  static isFaceLetter(letter: HebrewLetter): letter is FaceHebrewLetter {
    return this.faceMap.has(letter as FaceHebrewLetter);
  }

  // ============================================================
  // Edge Accessors
  // ============================================================

  /**
   * Get an edge by its Hebrew letter (type-safe).
   * Returns undefined if the letter doesn't correspond to an edge.
   */
  static getEdge(letter: EdgeHebrewLetter): Edge | undefined {
    return this.edgeMap.get(letter);
  }

  /**
   * Get an edge by its Hebrew letter with existence check.
   */
  static findEdge(letter: EdgeHebrewLetter): GeometryLookupResult<Edge> {
    const element = this.edgeMap.get(letter);
    if (element) {
      return { found: true, element };
    }
    return { found: false, element: undefined };
  }

  /**
   * Get all edges (immutable array).
   */
  static getAllEdges(): readonly Edge[] {
    return edges;
  }

  /**
   * Check if a Hebrew letter corresponds to an edge.
   */
  static isEdgeLetter(letter: HebrewLetter): letter is EdgeHebrewLetter {
    return this.edgeMap.has(letter as EdgeHebrewLetter);
  }

  // ============================================================
  // Axis Accessors
  // ============================================================

  /**
   * Get an axis by its Hebrew letter (type-safe).
   * Returns undefined if the letter doesn't correspond to an axis.
   */
  static getAxis(letter: AxisHebrewLetter): Axis | undefined {
    return this.axisMap.get(letter);
  }

  /**
   * Get an axis by its Hebrew letter with existence check.
   */
  static findAxis(letter: AxisHebrewLetter): GeometryLookupResult<Axis> {
    const element = this.axisMap.get(letter);
    if (element) {
      return { found: true, element };
    }
    return { found: false, element: undefined };
  }

  /**
   * Get all axes (immutable array).
   */
  static getAllAxes(): readonly Axis[] {
    return axes;
  }

  /**
   * Check if a Hebrew letter corresponds to an axis.
   */
  static isAxisLetter(letter: HebrewLetter): letter is AxisHebrewLetter {
    return this.axisMap.has(letter as AxisHebrewLetter);
  }

  // ============================================================
  // Diagonal Accessors
  // ============================================================

  /**
   * Get a diagonal by its Hebrew letter (type-safe).
   * Returns undefined if the letter doesn't correspond to a diagonal.
   */
  static getDiagonal(letter: DiagonalHebrewLetter): Diagonal | undefined {
    return this.diagonalMap.get(letter);
  }

  /**
   * Get a diagonal by its Hebrew letter with existence check.
   */
  static findDiagonal(
    letter: DiagonalHebrewLetter
  ): GeometryLookupResult<Diagonal> {
    const element = this.diagonalMap.get(letter);
    if (element) {
      return { found: true, element };
    }
    return { found: false, element: undefined };
  }

  /**
   * Get all diagonals (immutable array).
   */
  static getAllDiagonals(): readonly Diagonal[] {
    return diagonals;
  }

  /**
   * Check if a Hebrew letter corresponds to a diagonal.
   */
  static isDiagonalLetter(
    letter: HebrewLetter
  ): letter is DiagonalHebrewLetter {
    return this.diagonalMap.has(letter as DiagonalHebrewLetter);
  }

  // ============================================================
  // Generic Accessors
  // ============================================================

  /**
   * Get any geometric element by Hebrew letter.
   * Returns the element with its type information.
   */
  static getElementByLetter(
    letter: HebrewLetter
  ):
    | { type: 'face'; element: Face }
    | { type: 'edge'; element: Edge }
    | { type: 'axis'; element: Axis }
    | { type: 'diagonal'; element: Diagonal }
    | { type: 'center'; element: Face }
    | { type: 'unknown'; element: undefined } {
    // Check center first
    if (letter === 'Tav') {
      return { type: 'center', element: center };
    }

    // Check faces
    const face = this.faceMap.get(letter as FaceHebrewLetter);
    if (face) {
      return { type: 'face', element: face };
    }

    // Check edges
    const edge = this.edgeMap.get(letter as EdgeHebrewLetter);
    if (edge) {
      return { type: 'edge', element: edge };
    }

    // Check axes
    const axis = this.axisMap.get(letter as AxisHebrewLetter);
    if (axis) {
      return { type: 'axis', element: axis };
    }

    // Check diagonals
    const diagonal = this.diagonalMap.get(letter as DiagonalHebrewLetter);
    if (diagonal) {
      return { type: 'diagonal', element: diagonal };
    }

    return { type: 'unknown', element: undefined };
  }

  /**
   * Get the geometric type of a Hebrew letter.
   */
  static getLetterType(
    letter: HebrewLetter
  ): 'face' | 'edge' | 'axis' | 'diagonal' | 'center' | 'unknown' {
    if (letter === 'Tav') return 'center';
    if (this.isFaceLetter(letter)) return 'face';
    if (this.isEdgeLetter(letter)) return 'edge';
    if (this.isAxisLetter(letter)) return 'axis';
    if (this.isDiagonalLetter(letter)) return 'diagonal';
    return 'unknown';
  }

  // ============================================================
  // Collection Accessors
  // ============================================================

  /**
   * Get all geometric elements as a flat array.
   */
  static getAllElements(): readonly (Face | Edge | Axis | Diagonal)[] {
    return [...faces, center, ...edges, ...axes, ...diagonals];
  }

  /**
   * Get count of each geometric type.
   */
  static getCounts(): {
    faces: number;
    edges: number;
    axes: number;
    diagonals: number;
    center: 1;
    total: number;
  } {
    return {
      faces: faces.length,
      edges: edges.length,
      axes: axes.length,
      diagonals: diagonals.length,
      center: 1,
      total: faces.length + edges.length + axes.length + diagonals.length + 1,
    };
  }

  // ============================================================
  // Validation
  // ============================================================

  /**
   * Validate that all geometric elements have unique Hebrew letters.
   * This should always be true but provides runtime verification.
   */
  static validateUniqueness(): {
    isValid: boolean;
    duplicates: HebrewLetter[];
  } {
    const allLetters = [
      ...faces.map((f) => f.letter),
      center.letter,
      ...edges.map((e) => e.letter),
      ...axes.map((a) => a.letter),
      ...diagonals.map((d) => d.letter),
    ];

    const seen = new Set<HebrewLetter>();
    const duplicates: HebrewLetter[] = [];

    for (const letter of allLetters) {
      if (seen.has(letter)) {
        duplicates.push(letter);
      }
      seen.add(letter);
    }

    return {
      isValid: duplicates.length === 0,
      duplicates,
    };
  }
}

/**
 * Convenience re-exports for backward compatibility.
 * Components can continue to import raw arrays if needed.
 */
export {
  axes as rawAxes,
  center as rawCenter,
  diagonals as rawDiagonals,
  edges as rawEdges,
  faces as rawFaces,
};
