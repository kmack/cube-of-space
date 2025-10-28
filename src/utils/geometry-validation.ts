// src/utils/geometry-validation.ts

import type { Axis, Diagonal, Edge, Vec3 } from './types';

/**
 * Validation result for a single vector
 */
export interface VectorValidationResult {
  isValid: boolean;
  hasNaN: boolean;
  isNormalized: boolean;
  length: number;
  vector: Vec3;
  name: string;
  errorMessage?: string;
  warningMessage?: string;
}

/**
 * Complete geometry validation result
 */
export interface GeometryValidationResult {
  isValid: boolean;
  hasErrors: boolean;
  hasWarnings: boolean;
  errors: string[];
  warnings: string[];
  vectorResults: VectorValidationResult[];
}

/**
 * Configuration for geometry validation
 */
export interface GeometryValidationConfig {
  /**
   * Tolerance for normalized vector length check
   * Default: 1e-6
   */
  normalizationTolerance?: number;

  /**
   * Whether to throw errors on validation failure
   * Default: true
   */
  throwOnError?: boolean;

  /**
   * Whether to log warnings to console
   * Default: true in development, false in production
   */
  logWarnings?: boolean;

  /**
   * Whether to log success message
   * Default: true in development, false in production
   */
  logSuccess?: boolean;
}

/**
 * Service for validating geometric data integrity
 *
 * Responsibilities:
 * - Validate that vectors are properly normalized
 * - Check for NaN values in vectors
 * - Provide detailed validation results
 * - Support both throwing errors and returning results
 *
 * This service is separated from the data module to maintain
 * clear responsibility boundaries between data definition and validation.
 */
export class GeometryValidationService {
  private static readonly DEFAULT_TOLERANCE = 1e-6;
  // Access NODE_ENV with type assertion for build-time constant
  private static readonly IS_PRODUCTION =
    (process as unknown as { env: { NODE_ENV?: string } }).env.NODE_ENV ===
    'production';
  private static readonly DEFAULT_CONFIG: Required<GeometryValidationConfig> = {
    normalizationTolerance: GeometryValidationService.DEFAULT_TOLERANCE,
    throwOnError: true,
    logWarnings: !GeometryValidationService.IS_PRODUCTION,
    logSuccess: !GeometryValidationService.IS_PRODUCTION,
  };

  /**
   * Validate a single vector for normalization and NaN values
   */
  static validateVector(
    vector: Vec3,
    name: string,
    tolerance: number = GeometryValidationService.DEFAULT_TOLERANCE
  ): VectorValidationResult {
    const [x, y, z] = vector;
    const hasNaN = isNaN(x) || isNaN(y) || isNaN(z);
    const length = Math.sqrt(x * x + y * y + z * z);
    const isNormalized = Math.abs(length - 1.0) < tolerance;

    let errorMessage: string | undefined;
    let warningMessage: string | undefined;

    if (hasNaN) {
      errorMessage = `${name} contains NaN values: [${x}, ${y}, ${z}]`;
    } else if (!isNormalized) {
      warningMessage = `${name} is not normalized. Length: ${length}, Vector: [${x}, ${y}, ${z}]`;
    }

    return {
      isValid: !hasNaN && isNormalized,
      hasNaN,
      isNormalized,
      length,
      vector,
      name,
      errorMessage,
      warningMessage,
    };
  }

  /**
   * Validate all vectors in an edge
   */
  static validateEdge(
    edge: Edge,
    tolerance?: number
  ): VectorValidationResult[] {
    return [
      this.validateVector(edge.normal, `Edge ${edge.letter} normal`, tolerance),
      this.validateVector(
        edge.tangent,
        `Edge ${edge.letter} tangent`,
        tolerance
      ),
    ];
  }

  /**
   * Validate all vectors in an axis
   */
  static validateAxis(
    axis: Axis,
    tolerance?: number
  ): VectorValidationResult[] {
    return [
      this.validateVector(axis.normal, `Axis ${axis.letter} normal`, tolerance),
      this.validateVector(
        axis.tangent,
        `Axis ${axis.letter} tangent`,
        tolerance
      ),
    ];
  }

  /**
   * Validate all vectors in a diagonal
   */
  static validateDiagonal(
    diagonal: Diagonal,
    tolerance?: number
  ): VectorValidationResult[] {
    return [
      this.validateVector(
        diagonal.normal,
        `Diagonal ${diagonal.letter} normal`,
        tolerance
      ),
      this.validateVector(
        diagonal.tangent,
        `Diagonal ${diagonal.letter} tangent`,
        tolerance
      ),
    ];
  }

  /**
   * Validate complete geometry (edges, axes, diagonals)
   */
  static validateGeometry(
    edges: readonly Edge[],
    axes: readonly Axis[],
    diagonals: readonly Diagonal[],
    config: GeometryValidationConfig = {}
  ): GeometryValidationResult {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    const vectorResults: VectorValidationResult[] = [];

    // Validate all edges
    edges.forEach((edge) => {
      vectorResults.push(
        ...this.validateEdge(edge, finalConfig.normalizationTolerance)
      );
    });

    // Validate all axes
    axes.forEach((axis) => {
      vectorResults.push(
        ...this.validateAxis(axis, finalConfig.normalizationTolerance)
      );
    });

    // Validate all diagonals
    diagonals.forEach((diagonal) => {
      vectorResults.push(
        ...this.validateDiagonal(diagonal, finalConfig.normalizationTolerance)
      );
    });

    // Collect errors and warnings
    const errors = vectorResults
      .filter((r) => r.errorMessage)
      .map((r) => r.errorMessage!);

    const warnings = vectorResults
      .filter((r) => r.warningMessage)
      .map((r) => r.warningMessage!);

    const hasErrors = errors.length > 0;
    const hasWarnings = warnings.length > 0;
    const isValid = !hasErrors && !hasWarnings;

    // Handle errors
    if (hasErrors && finalConfig.throwOnError) {
      throw new Error(
        `Geometry validation failed:\n${errors.map((e) => `  - ${e}`).join('\n')}`
      );
    }

    // Log warnings
    if (hasWarnings && finalConfig.logWarnings) {
      warnings.forEach((warning) => {
        console.warn(`Geometry validation warning: ${warning}`);
      });
    }

    // Log success
    // if (isValid && finalConfig.logSuccess) {
    //   console.info(
    //     '✓ Geometry validation passed: all vectors properly normalized'
    //   );
    // }

    return {
      isValid,
      hasErrors,
      hasWarnings,
      errors,
      warnings,
      vectorResults,
    };
  }

  /**
   * Validate geometry and throw on any errors
   * Convenience method for the common case of throwing on validation failure
   */
  static validateGeometryOrThrow(
    edges: readonly Edge[],
    axes: readonly Axis[],
    diagonals: readonly Diagonal[],
    config: Omit<GeometryValidationConfig, 'throwOnError'> = {}
  ): void {
    this.validateGeometry(edges, axes, diagonals, {
      ...config,
      throwOnError: true,
    });
  }

  /**
   * Validate geometry and return result without throwing
   * Useful for testing or when you want to handle validation results programmatically
   */
  static validateGeometrySafe(
    edges: readonly Edge[],
    axes: readonly Axis[],
    diagonals: readonly Diagonal[],
    config: Omit<GeometryValidationConfig, 'throwOnError'> = {}
  ): GeometryValidationResult {
    return this.validateGeometry(edges, axes, diagonals, {
      ...config,
      throwOnError: false,
    });
  }
}
