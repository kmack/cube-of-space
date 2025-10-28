/**
 * @fileoverview Service for calculating energy flow start and end positions along
 * cube edges based on flow direction and edge geometry.
 */

// src/utils/energy-flow-geometry.ts
import * as THREE from 'three';

import { HALF } from '../data/constants';
import type { Edge } from './types';
import type { Vec3 } from './types';

/**
 * Result of edge flow position calculation
 */
export interface EdgeFlowPositions {
  startPos: Vec3;
  endPos: Vec3;
}

/**
 * EnergyFlowGeometry - Service for calculating energy flow positions along cube geometry
 *
 * This service encapsulates the complex geometric calculations for determining
 * start and end positions of energy flows along cube edges. By separating this
 * logic from React components, we achieve:
 *
 * - Clear separation of concerns (geometry vs rendering)
 * - Easier testing of calculation logic
 * - Improved readability and maintainability
 * - Reusable across different energy flow components
 *
 * The calculations handle three main cases:
 * 1. Vertical edges (parallel to Y-axis)
 * 2. Horizontal edges along X-axis (East-West)
 * 3. Horizontal edges along Z-axis (North-South)
 * 4. Fallback for diagonal or special cases
 */
export class EnergyFlowGeometry {
  /**
   * Threshold for determining if a vector component is aligned with an axis
   * A value > 0.9 indicates the vector is nearly parallel to that axis
   */
  private static readonly AXIS_ALIGNMENT_THRESHOLD = 0.9;

  /**
   * Fallback tangent length multiplier for non-axis-aligned edges
   * Reduced to 0.8 to prevent overflow beyond cube boundaries
   */
  private static readonly TANGENT_LENGTH_FACTOR = 0.8;

  /**
   * Calculate start and end positions for energy flow along an edge
   *
   * This method determines the appropriate flow positions based on the edge's
   * orientation (vertical, horizontal X, horizontal Z, or diagonal).
   *
   * @param edge - The edge geometry definition
   * @returns Object containing start and end positions as Vec3 tuples
   *
   * @example
   * ```typescript
   * const edge = edges[0]; // Get first edge
   * const { startPos, endPos } = EnergyFlowGeometry.calculateEdgeFlowPositions(edge);
   * // Use startPos and endPos for EnergyFlow component
   * ```
   */
  static calculateEdgeFlowPositions(edge: Edge): EdgeFlowPositions {
    const tangent = new THREE.Vector3(...edge.tangent);

    // Determine edge orientation and calculate appropriate positions
    if (this.isVerticalEdge(tangent)) {
      return this.calculateVerticalFlow(edge);
    }

    if (this.isXAxisAligned(tangent)) {
      return this.calculateXAxisFlow(edge);
    }

    if (this.isZAxisAligned(tangent)) {
      return this.calculateZAxisFlow(edge);
    }

    // Fallback for non-axis-aligned edges (diagonals, special cases)
    return this.calculateTangentFlow(edge, tangent);
  }

  /**
   * Check if edge is vertical (parallel to Y-axis)
   *
   * @param tangent - Normalized tangent vector of the edge
   * @returns True if edge is vertical
   */
  private static isVerticalEdge(tangent: THREE.Vector3): boolean {
    return Math.abs(tangent.y) > this.AXIS_ALIGNMENT_THRESHOLD;
  }

  /**
   * Check if edge is aligned with X-axis (East-West direction)
   *
   * @param tangent - Normalized tangent vector of the edge
   * @returns True if edge runs along X-axis
   */
  private static isXAxisAligned(tangent: THREE.Vector3): boolean {
    return Math.abs(tangent.x) > this.AXIS_ALIGNMENT_THRESHOLD;
  }

  /**
   * Check if edge is aligned with Z-axis (North-South direction)
   *
   * @param tangent - Normalized tangent vector of the edge
   * @returns True if edge runs along Z-axis
   */
  private static isZAxisAligned(tangent: THREE.Vector3): boolean {
    return Math.abs(tangent.z) > this.AXIS_ALIGNMENT_THRESHOLD;
  }

  /**
   * Calculate flow positions for vertical edges
   *
   * Vertical edges flow from bottom to top of the cube.
   * The X and Z coordinates are fixed to the edge position,
   * while Y ranges from -HALF to +HALF.
   *
   * @param edge - Edge geometry
   * @returns Start and end positions for vertical flow
   */
  private static calculateVerticalFlow(edge: Edge): EdgeFlowPositions {
    return {
      startPos: [edge.pos[0], -HALF, edge.pos[2]],
      endPos: [edge.pos[0], +HALF, edge.pos[2]],
    };
  }

  /**
   * Calculate flow positions for X-axis aligned edges (East-West)
   *
   * These edges run horizontally along the X-axis.
   * The Y and Z coordinates are fixed to the edge position,
   * while X ranges from -HALF to +HALF.
   *
   * @param edge - Edge geometry
   * @returns Start and end positions for X-axis flow
   */
  private static calculateXAxisFlow(edge: Edge): EdgeFlowPositions {
    return {
      startPos: [-HALF, edge.pos[1], edge.pos[2]],
      endPos: [+HALF, edge.pos[1], edge.pos[2]],
    };
  }

  /**
   * Calculate flow positions for Z-axis aligned edges (North-South)
   *
   * These edges run horizontally along the Z-axis.
   * The X and Y coordinates are fixed to the edge position,
   * while Z ranges from -HALF to +HALF.
   *
   * @param edge - Edge geometry
   * @returns Start and end positions for Z-axis flow
   */
  private static calculateZAxisFlow(edge: Edge): EdgeFlowPositions {
    return {
      startPos: [edge.pos[0], edge.pos[1], -HALF],
      endPos: [edge.pos[0], edge.pos[1], +HALF],
    };
  }

  /**
   * Calculate flow positions using tangent vector (fallback for non-aligned edges)
   *
   * For edges that don't align with primary axes, calculate positions
   * by extending along the tangent vector from the edge center.
   * Uses a reduced tangent length (0.8 * HALF) to prevent overflow.
   *
   * @param edge - Edge geometry
   * @param tangent - Normalized tangent vector
   * @returns Start and end positions calculated from tangent
   */
  private static calculateTangentFlow(
    edge: Edge,
    tangent: THREE.Vector3
  ): EdgeFlowPositions {
    const edgePos = new THREE.Vector3(...edge.pos);
    const tangentLength = HALF * this.TANGENT_LENGTH_FACTOR;

    const startOffset = tangent.clone().multiplyScalar(-tangentLength);
    const endOffset = tangent.clone().multiplyScalar(tangentLength);

    const startPos = edgePos.clone().add(startOffset).toArray() as Vec3;
    const endPos = edgePos.clone().add(endOffset).toArray() as Vec3;

    return { startPos, endPos };
  }

  /**
   * Batch calculate flow positions for multiple edges
   *
   * Useful for initializing all edge flows at once.
   * More efficient than calling calculateEdgeFlowPositions multiple times
   * in user code.
   *
   * @param edges - Array of edge geometries
   * @returns Array of flow position results, parallel to input edges
   *
   * @example
   * ```typescript
   * const allFlowPositions = EnergyFlowGeometry.calculateBatchFlowPositions(edges);
   * allFlowPositions.forEach((positions, i) => {
   *   const edge = edges[i];
   *   // Use positions.startPos and positions.endPos
   * });
   * ```
   */
  static calculateBatchFlowPositions(
    edges: readonly Edge[]
  ): EdgeFlowPositions[] {
    return edges.map((edge) => this.calculateEdgeFlowPositions(edge));
  }
}
