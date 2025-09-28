// src/components/rich-label.tsx
import * as React from 'react';
import * as THREE from 'three';
import {
  createHebrewLabelTexture,
  createCanvasTexture,
} from '../utils/canvas-texture';
import type {
  CanvasLabelConfig,
  BackgroundStyle,
} from '../utils/canvas-texture';
import {
  createUpscalingMaterial,
  calculateOptimalSharpness,
} from '../utils/upscaling-shader';

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
  useUpscalingShader?: boolean;
  customSharpness?: number;
};

export function RichLabel({
  title,
  subtitle,
  hebrewLetter,
  imagePath,
  images: _images, // Prefixed with _ to indicate intentionally unused for now
  color = 'white',
  background,
  width = 900,
  height = 800,
  scale = 1,
  hebrewFont,
  uiFont,
  canvasConfig,
  useMemoryOptimization = true, // Enable by default for iOS compatibility
  useUpscalingShader = false,
  customSharpness,
}: RichLabelProps): React.JSX.Element {
  const [texture, setTexture] = React.useState<THREE.Texture | null>(null);
  const [material, setMaterial] = React.useState<THREE.Material | null>(null);

  React.useEffect(() => {
    let mounted = true;

    // Use custom canvas config if provided, otherwise use Hebrew label helper
    const texturePromise = canvasConfig
      ? createCanvasTexture({
          ...canvasConfig,
          useOptimizedFormat: useMemoryOptimization,
          targetResolution: useMemoryOptimization
            ? {
                width: Math.min(canvasConfig.width, 600),
                height: Math.min(canvasConfig.height, 480),
              }
            : undefined,
        })
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
          setTexture(tex);

          // Create appropriate material based on optimization settings
          if (useUpscalingShader && useMemoryOptimization) {
            const targetRes = { width, height };
            const sourceRes = canvasConfig?.targetResolution || {
              width: Math.min(width, 600),
              height: Math.min(height, 480),
            };

            const sharpness =
              customSharpness ??
              calculateOptimalSharpness(sourceRes, targetRes);
            const upscalingMat = createUpscalingMaterial(tex, { sharpness });
            setMaterial(upscalingMat);
          } else {
            // Use basic material
            const basicMat = new THREE.MeshBasicMaterial({
              map: tex,
              transparent: true,
              side: THREE.BackSide,
              toneMapped: false,
            });
            setMaterial(basicMat);
          }
        }
      })
      .catch((error) => {
        console.error('Failed to create label texture:', error);
      });

    return () => {
      mounted = false;
      // Cleanup will be handled by the next effect run
      // Don't dispose here as it could interfere with React's lifecycle
    };
  }, [
    title,
    subtitle,
    hebrewLetter,
    imagePath,
    color,
    width,
    height,
    background,
    hebrewFont,
    uiFont,
    canvasConfig,
    useMemoryOptimization,
    useUpscalingShader,
    customSharpness,
  ]);

  // Separate cleanup effect for proper disposal
  React.useEffect(() => {
    return () => {
      if (material) {
        material.dispose();
      }
      if (texture) {
        texture.dispose();
      }
    };
  }, [material, texture]);

  if (!texture || !material) {
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
    <mesh scale={finalScale} rotation={[Math.PI, 0, 0]} material={material}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
}

// Enhanced version for complex layouts with multiple images and text areas
export function ComplexRichLabel({
  canvasConfig,
  scale = 1,
}: {
  canvasConfig: CanvasLabelConfig;
  scale?: number | [number, number];
}): React.JSX.Element {
  const [texture, setTexture] = React.useState<THREE.Texture | null>(null);

  React.useEffect(() => {
    let mounted = true;

    createCanvasTexture(canvasConfig)
      .then((tex) => {
        if (mounted) {
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
  }, [canvasConfig, texture]);

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
    <mesh scale={finalScale} rotation={[Math.PI, 0, 0]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={texture}
        transparent
        side={THREE.BackSide}
        toneMapped={false}
      />
    </mesh>
  );
}
