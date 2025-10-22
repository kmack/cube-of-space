// src/config/app-config.ts

/**
 * Centralized application configuration
 * All magic numbers and configuration values in one place for easy maintenance
 */
export const APP_CONFIG = {
  /**
   * Performance-related settings
   */
  performance: {
    /** Idle timeout in milliseconds before pausing animations */
    idleTimeoutMs: 10000,
    /** Target FPS for mobile devices */
    mobileTargetFPS: 30,
    /** Target FPS for desktop devices */
    desktopTargetFPS: 60,
  },

  /**
   * Control system settings
   */
  controls: {
    /** Gamepad control configuration */
    gamepad: {
      /** Rotation speed multiplier */
      rotateSpeed: 10.0,
      /** Zoom speed multiplier */
      zoomSpeed: 3.0,
      /** Pan speed multiplier */
      panSpeed: 2.0,
      /** Rotation curve factor for smoothing */
      rotationCurve: 2.5,
      /** Deadzone threshold for analog sticks (0-1) */
      deadzone: 0.15,
    },
    /** Orbit controls configuration */
    orbit: {
      /** Damping factor for smooth camera movement (0-1) */
      dampingFactor: 0.15,
      /** Base rotation speed */
      rotateSpeed: 0.9,
    },
  },

  /**
   * Camera settings
   */
  camera: {
    /** Default camera position [x, y, z] */
    defaultPosition: [-3.5, 2, -3] as const,
    /** Default camera look-at target [x, y, z] */
    defaultTarget: [0, 0, 0] as const,
    /** Field of view in degrees */
    fov: 50,
    /** Duration of camera reset animation in milliseconds */
    resetAnimationDuration: 1000,
  },

  /**
   * Rendering and visual settings
   */
  rendering: {
    /** Energy particle system configuration */
    particleCount: {
      /** Particle count for mobile devices */
      mobile: 4,
      /** Particle count for desktop devices */
      desktop: 8,
      /** Maximum particle count limit */
      max: 16,
    },
    /** Device pixel ratio configuration */
    dpr: {
      /** DPR range for mobile [min, max] */
      mobile: [1, 1.5] as const,
      /** DPR range for desktop [min, max] */
      desktop: [1, 2] as const,
    },
  },

  /**
   * Geometric constants
   */
  geometry: {
    /** Label offset distance from cube surfaces */
    labelOffset: 0.6,
    /** Mother letter label offset along axes */
    motherOffset: 1.0,
    /** Label scale factor */
    labelScale: 0.6,
  },
} as const;

/**
 * Type for the entire configuration object
 */
export type AppConfig = typeof APP_CONFIG;
