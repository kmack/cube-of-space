// src/components/rich-label.tsx
import * as React from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import {
  createHebrewLabelTexture,
  createStructuredHebrewLabel,
  createCanvasTexture,
} from '../utils/canvas-texture';
import type {
  CanvasLabelConfig,
  BackgroundStyle,
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
};

export function RichLabel({
  title,
  subtitle,
  hebrewLetter,
  imagePath,
  images: _images, // Prefixed with _ to indicate intentionally unused for now
  letterName,
  assocGlyph,
  assocName,
  color = 'white',
  background,
  width = 900,
  height = 800,
  scale = 1,
  hebrewFont,
  uiFont,
  canvasConfig,
  useMemoryOptimization = true, // Enable by default for iOS compatibility
  renderOrder = 0,
}: RichLabelProps): React.JSX.Element {
  const [texture, setTexture] = React.useState<THREE.Texture | null>(null);
  const gl = useThree((state) => state.gl);

  React.useEffect(() => {
    let mounted = true;

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
        })
      : letterName && assocGlyph && assocName
        ? createStructuredHebrewLabel(
            hebrewLetter || '',
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
            }
          )
        : createHebrewLabelTexture(hebrewLetter || '', title, subtitle, {
            width,
            height,
            color,
            background,
            hebrewFont,
            uiFont,
            imagePath,
            useMemoryOptimization,
          });

    texturePromise
      .then((tex) => {
        if (mounted) {
          // Enable anisotropic filtering for better quality on scaled textures
          const maxAnisotropy = gl.capabilities.getMaxAnisotropy();
          tex.anisotropy = Math.min(4, maxAnisotropy); // Use up to 4x anisotropic filtering
          setTexture(tex);
        }
      })
      .catch((error) => {
        console.error('Failed to create label texture:', error);
      });

    return () => {
      mounted = false;
    };
  }, [
    title,
    subtitle,
    hebrewLetter,
    letterName,
    assocGlyph,
    assocName,
    imagePath,
    color,
    width,
    height,
    background,
    hebrewFont,
    uiFont,
    canvasConfig,
    useMemoryOptimization,
    gl,
  ]);

  // Separate cleanup effect for proper disposal
  React.useEffect(() => {
    return () => {
      if (texture) {
        texture.dispose();
      }
    };
  }, [texture]);

  if (!texture) {
    return <group />; // Return empty group while loading
  }

  // Calculate scale - support both uniform and non-uniform scaling
  const scaleArray = Array.isArray(scale) ? scale : [scale, scale];
  const aspectRatio = width / height;
  const finalScale: [number, number, number] = [
    scaleArray[0] * aspectRatio,
    scaleArray[1],
    1,
  ];

  return (
    <mesh
      scale={finalScale}
      rotation={[Math.PI, 0, 0]}
      renderOrder={renderOrder}
    >
      <planeGeometry args={[1, 1]} />
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

// Enhanced version for complex layouts with multiple images and text areas
export function ComplexRichLabel({
  canvasConfig,
  scale = 1,
  renderOrder = 0,
}: {
  canvasConfig: CanvasLabelConfig;
  scale?: number | [number, number];
  renderOrder?: number;
}): React.JSX.Element {
  const [texture, setTexture] = React.useState<THREE.Texture | null>(null);
  const gl = useThree((state) => state.gl);

  React.useEffect(() => {
    let mounted = true;

    createCanvasTexture(canvasConfig)
      .then((tex) => {
        if (mounted) {
          // Enable anisotropic filtering for better quality
          const maxAnisotropy = gl.capabilities.getMaxAnisotropy();
          tex.anisotropy = Math.min(4, maxAnisotropy);
          setTexture(tex);
        }
      })
      .catch((error) => {
        console.error('Failed to create complex label texture:', error);
      });

    return () => {
      mounted = false;
      if (texture) {
        texture.dispose();
      }
    };
  }, [canvasConfig, texture, gl]);

  if (!texture) {
    return <group />;
  }

  const scaleArray = Array.isArray(scale) ? scale : [scale, scale];
  const aspectRatio = canvasConfig.width / canvasConfig.height;
  const finalScale: [number, number, number] = [
    scaleArray[0] * aspectRatio,
    scaleArray[1],
    1,
  ];

  return (
    <mesh
      scale={finalScale}
      rotation={[Math.PI, 0, 0]}
      renderOrder={renderOrder}
    >
      <planeGeometry args={[1, 1]} />
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
