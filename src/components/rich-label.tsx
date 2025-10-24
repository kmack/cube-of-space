// src/components/rich-label.tsx
import { useThree } from '@react-three/fiber';
import * as React from 'react';
import * as THREE from 'three';

import {
  LABEL_HEIGHT_WITH_IMAGE,
  LABEL_WIDTH_WITH_IMAGE,
} from '../data/constants';
import type {
  BackgroundStyle,
  CanvasLabelConfig,
} from '../utils/canvas-texture';
import {
  createCanvasTexture,
  createHebrewLabelTexture,
  createStructuredHebrewLabel,
} from '../utils/canvas-texture';

export type RichLabelProps = {
  // Content
  title: string;
  subtitle?: string;
  hebrewLetter?: string;
  imagePath?: string; // Path to Tarot image
  images?: Array<{
    src: string;
    width: number;
    height: number;
    x: number;
    y: number;
  }>;

  // New structured label data
  letterName?: string;
  assocGlyph?: string;
  assocName?: string;

  // Additional correspondences
  colorName?: string;
  colorValue?: string;
  note?: string;
  significance?: string;
  gematria?: number;
  alchemy?: string;
  intelligence?: string;
  showColorBorders?: boolean;

  // Outer planet attribution (Mother letters only)
  outerPlanet?: string;
  outerPlanetGlyph?: string;

  // Styling
  color?: string;
  background?: BackgroundStyle;

  // Layout dimensions
  width?: number;
  height?: number;
  scale?: number | [number, number];

  // Fonts (will use your existing font paths)
  hebrewFont?: string;
  uiFont?: string;

  // Advanced canvas config for complex layouts
  canvasConfig?: CanvasLabelConfig;

  // Memory optimization options
  useMemoryOptimization?: boolean;

  // Render order for transparency sorting
  renderOrder?: number;

  // Material side for billboard compatibility
  materialSide?: THREE.Side;

  // Double-sided rendering (alternative to materialSide for easier use)
  doubleSided?: boolean;

  // Depth testing for overlay labels (false = always on top)
  depthTest?: boolean;

  // Skip 180° flip for billboarded labels
  flipY?: boolean;
};

function RichLabelComponent({
  title,
  subtitle,
  hebrewLetter,
  imagePath,
  images: _images, // Prefixed with _ to indicate intentionally unused for now
  letterName,
  assocGlyph,
  assocName,
  colorName,
  colorValue,
  note,
  significance,
  gematria,
  alchemy,
  intelligence,
  showColorBorders = true,
  outerPlanet,
  outerPlanetGlyph,
  color = 'white',
  background,
  width = LABEL_WIDTH_WITH_IMAGE,
  height = LABEL_HEIGHT_WITH_IMAGE,
  scale = 1,
  hebrewFont,
  uiFont,
  canvasConfig,
  useMemoryOptimization = true, // Enable by default for iOS compatibility
  renderOrder = 0,
  materialSide = THREE.BackSide, // BackSide for normal use, DoubleSide for billboards
  doubleSided = false,
  depthTest = true, // true for normal labels, false for overlay UI labels
  flipY = true, // true for normal labels, false for billboards
}: RichLabelProps): React.JSX.Element {
  // Convert doubleSided boolean to THREE.Side if materialSide not explicitly set
  const effectiveMaterialSide = doubleSided ? THREE.DoubleSide : materialSide;
  const [texture, setTexture] = React.useState<THREE.Texture | null>(null);
  const textureRef = React.useRef<THREE.Texture | null>(null);
  const gl = useThree((state) => state.gl);

  // Note: Border is now handled via overlay mesh, not baked into texture
  // This avoids expensive texture regeneration on toggle

  React.useEffect(() => {
    // Create AbortController for true cancellation
    const abortController = new AbortController();
    let currentTexture: THREE.Texture | null = null;

    // Use custom canvas config if provided, otherwise use Hebrew label helper
    const texturePromise = canvasConfig
      ? createCanvasTexture({
          ...canvasConfig,
          useOptimizedFormat:
            canvasConfig.useOptimizedFormat ?? useMemoryOptimization,
          targetResolution:
            canvasConfig.targetResolution ??
            (useMemoryOptimization
              ? {
                  width: Math.min(canvasConfig.width, 600),
                  height: Math.min(canvasConfig.height, 480),
                }
              : undefined),
          signal: abortController.signal,
        })
      : letterName && assocGlyph && assocName
        ? createStructuredHebrewLabel(
            hebrewLetter ?? '',
            letterName,
            assocGlyph,
            assocName,
            title,
            {
              width,
              height,
              color,
              background,
              hebrewFont,
              uiFont,
              imagePath,
              useMemoryOptimization,
              signal: abortController.signal,
              colorName,
              colorValue,
              note,
              significance,
              gematria,
              alchemy,
              intelligence,
              showColorBorders,
              outerPlanet,
              outerPlanetGlyph,
            }
          )
        : createHebrewLabelTexture(hebrewLetter ?? '', title, subtitle, {
            width,
            height,
            color,
            background,
            hebrewFont,
            uiFont,
            imagePath,
            useMemoryOptimization,
            signal: abortController.signal,
          });

    texturePromise
      .then((tex) => {
        // Check if component is still mounted
        if (!abortController.signal.aborted) {
          // Enable anisotropic filtering for better quality on scaled textures
          const maxAnisotropy = gl.capabilities.getMaxAnisotropy();
          tex.anisotropy = Math.min(4, maxAnisotropy); // Use up to 4x anisotropic filtering
          currentTexture = tex;
          textureRef.current = tex;
          setTexture(tex);
        } else {
          // Dispose texture if component unmounted before promise resolved
          tex.dispose();
        }
      })
      .catch((error) => {
        // Silently ignore AbortErrors as they are expected during unmount
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        console.error('Failed to create label texture:', error);
      });

    return () => {
      // Abort any pending texture creation
      abortController.abort();

      // Dispose the current texture when component unmounts or dependencies change
      if (currentTexture) {
        currentTexture.dispose();
        currentTexture = null;
      }
      textureRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- useMemoryOptimization and gl intentionally excluded to prevent unnecessary texture recreation
  }, [
    title,
    subtitle,
    hebrewLetter,
    letterName,
    assocGlyph,
    assocName,
    colorName,
    note,
    significance,
    gematria,
    alchemy,
    intelligence,
    imagePath,
    color,
    width,
    height,
    background,
    hebrewFont,
    uiFont,
    canvasConfig,
  ]);

  // Memoize geometry to avoid recreation - MUST be before conditional returns (Rules of Hooks)
  const planeGeometry = React.useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const meshRef = React.useRef<THREE.Mesh>(null!);

  // Dispose geometry on unmount to prevent memory leaks
  React.useEffect(() => {
    return () => {
      planeGeometry.dispose();
    };
  }, [planeGeometry]);

  // Update visibility imperatively to avoid React reconciliation issues
  React.useLayoutEffect(() => {
    if (meshRef.current) {
      meshRef.current.visible = !!textureRef.current;
    }
  });

  // Calculate scale - support both uniform and non-uniform scaling
  const scaleArray = Array.isArray(scale) ? scale : [scale, scale];
  const aspectRatio = width / height;
  const finalScale: [number, number, number] = [
    scaleArray[0] * aspectRatio,
    scaleArray[1],
    1,
  ];

  // Border outline geometry - only created when needed
  // This avoids texture regeneration for border toggle
  const borderLineGeometry = React.useMemo(() => {
    if (!showColorBorders || !colorValue || !background?.borderRadius)
      return null;

    // Extract border radius from background config
    const radius = background.borderRadius / 1000; // Normalize to match Three.js scale
    const padding = (background.padding ?? 0) / 1000;

    // Calculate dimensions accounting for padding
    const halfWidth = 0.5 - padding;
    const halfHeight = 0.5 - padding;

    // Clamp radius to not exceed half the smallest dimension
    const maxRadius = Math.min(halfWidth, halfHeight);
    const effectiveRadius = Math.min(radius, maxRadius);

    // Create rounded rectangle outline with continuous path
    const segments = 8; // Number of segments per corner arc
    const points: THREE.Vector3[] = [];

    // Start from right edge at vertical center, going counter-clockwise
    // Right edge - from center going down to bottom-right corner
    points.push(new THREE.Vector3(halfWidth, 0, 0));
    points.push(new THREE.Vector3(halfWidth, -halfHeight + effectiveRadius, 0));

    // Bottom-right corner arc (clockwise from right to bottom)
    for (let i = 0; i <= segments; i++) {
      const angle = 0 - (Math.PI / 2) * (i / segments); // 0° to -90°
      const x = halfWidth - effectiveRadius + effectiveRadius * Math.cos(angle);
      const y =
        -halfHeight + effectiveRadius + effectiveRadius * Math.sin(angle);
      points.push(new THREE.Vector3(x, y, 0));
    }

    // Bottom edge - from bottom-right corner to bottom-left corner
    points.push(
      new THREE.Vector3(-halfWidth + effectiveRadius, -halfHeight, 0)
    );

    // Bottom-left corner arc (clockwise from bottom to left)
    for (let i = 0; i <= segments; i++) {
      const angle = -Math.PI / 2 - (Math.PI / 2) * (i / segments); // -90° to -180°
      const x =
        -halfWidth + effectiveRadius + effectiveRadius * Math.cos(angle);
      const y =
        -halfHeight + effectiveRadius + effectiveRadius * Math.sin(angle);
      points.push(new THREE.Vector3(x, y, 0));
    }

    // Left edge - from bottom-left corner to top-left corner
    points.push(new THREE.Vector3(-halfWidth, halfHeight - effectiveRadius, 0));

    // Top-left corner arc (clockwise from left to top)
    for (let i = 0; i <= segments; i++) {
      const angle = Math.PI - (Math.PI / 2) * (i / segments); // 180° to 90°
      const x =
        -halfWidth + effectiveRadius + effectiveRadius * Math.cos(angle);
      const y =
        halfHeight - effectiveRadius + effectiveRadius * Math.sin(angle);
      points.push(new THREE.Vector3(x, y, 0));
    }

    // Top edge - from top-left corner to top-right corner
    points.push(new THREE.Vector3(halfWidth - effectiveRadius, halfHeight, 0));

    // Top-right corner arc (clockwise from top to right)
    for (let i = 0; i <= segments; i++) {
      const angle = Math.PI / 2 - (Math.PI / 2) * (i / segments); // 90° to 0°
      const x = halfWidth - effectiveRadius + effectiveRadius * Math.cos(angle);
      const y =
        halfHeight - effectiveRadius + effectiveRadius * Math.sin(angle);
      points.push(new THREE.Vector3(x, y, 0));
    }

    // Right edge - from top-right corner back to start
    points.push(new THREE.Vector3(halfWidth, 0, 0));

    return new THREE.BufferGeometry().setFromPoints(points);
  }, [
    showColorBorders,
    colorValue,
    background?.borderRadius,
    background?.padding,
  ]);

  // Dispose border geometry on unmount
  React.useEffect(() => {
    return () => {
      if (borderLineGeometry) {
        borderLineGeometry.dispose();
      }
    };
  }, [borderLineGeometry]);

  return (
    <group>
      {/* Main label texture */}
      <mesh
        ref={meshRef}
        scale={finalScale}
        rotation={flipY ? [Math.PI, 0, 0] : [0, 0, 0]}
        renderOrder={renderOrder}
        geometry={planeGeometry}
      >
        <meshBasicMaterial
          map={texture}
          transparent
          side={effectiveMaterialSide}
          toneMapped={false}
          depthWrite={false}
          depthTest={depthTest}
        />
      </mesh>

      {/* Colored border overlay - only rendered when enabled */}
      {showColorBorders && colorValue && borderLineGeometry && (
        <lineSegments
          scale={finalScale}
          rotation={flipY ? [Math.PI, 0, 0] : [0, 0, 0]}
          renderOrder={renderOrder + 1}
          position={[0, 0, 0.001]}
        >
          <primitive object={borderLineGeometry} attach="geometry" />
          <lineBasicMaterial color={colorValue} />
        </lineSegments>
      )}
    </group>
  );
}

// Memoize with custom comparison to prevent re-renders
// Only re-render if the actual texture content would change (title, subtitle, etc.)
export const RichLabel = React.memo(
  RichLabelComponent,
  (prevProps, nextProps) => {
    // Return true to SKIP re-render, false to allow re-render
    // Compare only the props that would actually change the texture content
    return (
      prevProps.title === nextProps.title &&
      prevProps.subtitle === nextProps.subtitle &&
      prevProps.hebrewLetter === nextProps.hebrewLetter &&
      prevProps.letterName === nextProps.letterName &&
      prevProps.assocGlyph === nextProps.assocGlyph &&
      prevProps.assocName === nextProps.assocName &&
      prevProps.colorName === nextProps.colorName &&
      prevProps.colorValue === nextProps.colorValue &&
      prevProps.note === nextProps.note &&
      prevProps.significance === nextProps.significance &&
      prevProps.gematria === nextProps.gematria &&
      prevProps.alchemy === nextProps.alchemy &&
      prevProps.intelligence === nextProps.intelligence &&
      prevProps.showColorBorders === nextProps.showColorBorders &&
      prevProps.outerPlanet === nextProps.outerPlanet &&
      prevProps.outerPlanetGlyph === nextProps.outerPlanetGlyph &&
      prevProps.imagePath === nextProps.imagePath &&
      prevProps.color === nextProps.color &&
      prevProps.width === nextProps.width &&
      prevProps.height === nextProps.height &&
      prevProps.hebrewFont === nextProps.hebrewFont &&
      prevProps.uiFont === nextProps.uiFont &&
      prevProps.scale === nextProps.scale &&
      prevProps.renderOrder === nextProps.renderOrder &&
      prevProps.doubleSided === nextProps.doubleSided &&
      prevProps.depthTest === nextProps.depthTest &&
      prevProps.flipY === nextProps.flipY &&
      prevProps.useMemoryOptimization === nextProps.useMemoryOptimization
      // Intentionally exclude: background, canvasConfig (would cause re-renders on parent state changes)
      // colorValue and showColorBorders ARE included to allow border toggle to work
    );
  }
);

// Enhanced version for complex layouts with multiple images and text areas
function ComplexRichLabelComponent({
  canvasConfig,
  scale = 1,
  renderOrder = 0,
}: {
  canvasConfig: CanvasLabelConfig;
  scale?: number | [number, number];
  renderOrder?: number;
}): React.JSX.Element {
  const [texture, setTexture] = React.useState<THREE.Texture | null>(null);
  const textureRef = React.useRef<THREE.Texture | null>(null);
  const gl = useThree((state) => state.gl);

  React.useEffect(() => {
    // Create AbortController for true cancellation
    const abortController = new AbortController();
    let currentTexture: THREE.Texture | null = null;

    createCanvasTexture({
      ...canvasConfig,
      signal: abortController.signal,
    })
      .then((tex) => {
        // Check if component is still mounted
        if (!abortController.signal.aborted) {
          // Enable anisotropic filtering for better quality
          const maxAnisotropy = gl.capabilities.getMaxAnisotropy();
          tex.anisotropy = Math.min(4, maxAnisotropy);
          currentTexture = tex;
          textureRef.current = tex;
          setTexture(tex);
        } else {
          // Dispose texture if component unmounted before promise resolved
          tex.dispose();
        }
      })
      .catch((error) => {
        // Silently ignore AbortErrors as they are expected during unmount
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        console.error('Failed to create complex label texture:', error);
      });

    return () => {
      // Abort any pending texture creation
      abortController.abort();

      // Dispose the current texture when component unmounts or dependencies change
      if (currentTexture) {
        currentTexture.dispose();
        currentTexture = null;
      }
      textureRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- gl intentionally excluded to prevent unnecessary texture recreation
  }, [canvasConfig]);

  // Memoize geometry to avoid recreation - MUST be before conditional returns (Rules of Hooks)
  const planeGeometry = React.useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const meshRef = React.useRef<THREE.Mesh>(null!);

  // Dispose geometry on unmount to prevent memory leaks
  React.useEffect(() => {
    return () => {
      planeGeometry.dispose();
    };
  }, [planeGeometry]);

  // Update visibility imperatively to avoid React reconciliation issues
  React.useLayoutEffect(() => {
    if (meshRef.current) {
      meshRef.current.visible = !!textureRef.current;
    }
  });

  const scaleArray = Array.isArray(scale) ? scale : [scale, scale];
  const aspectRatio = canvasConfig.width / canvasConfig.height;
  const finalScale: [number, number, number] = [
    scaleArray[0] * aspectRatio,
    scaleArray[1],
    1,
  ];

  return (
    <mesh
      ref={meshRef}
      scale={finalScale}
      rotation={[Math.PI, 0, 0]}
      renderOrder={renderOrder}
      geometry={planeGeometry}
    >
      <meshBasicMaterial
        map={texture}
        transparent
        side={THREE.BackSide}
        toneMapped={false}
        depthWrite={false}
      />
    </mesh>
  );
}

// Memoize with custom comparison to prevent unnecessary re-renders
export const ComplexRichLabel = React.memo(
  ComplexRichLabelComponent,
  (prevProps, nextProps) => {
    // Return true to SKIP re-render
    return (
      prevProps.scale === nextProps.scale &&
      prevProps.renderOrder === nextProps.renderOrder
      // Intentionally exclude: canvasConfig (object reference changes)
    );
  }
);
