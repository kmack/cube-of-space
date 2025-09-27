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
};

export function RichLabel({
  title,
  subtitle,
  hebrewLetter,
  imagePath,
  images: _images, // Prefixed with _ to indicate intentionally unused for now
  color = 'white',
  background,
  width = 800,  // Display size for consistency
  height = 900, // Display size for consistency
  scale = 1,
  hebrewFont,
  uiFont,
  canvasConfig,
}: RichLabelProps): React.JSX.Element {
  const [texture, setTexture] = React.useState<THREE.Texture | null>(null);

  React.useEffect(() => {
    let mounted = true;

    // Use custom canvas config if provided, otherwise use Hebrew label helper
    const texturePromise = canvasConfig
      ? createCanvasTexture(canvasConfig)
      : createHebrewLabelTexture(hebrewLetter || '', title, subtitle, {
          width,
          height,
          color,
          background,
          hebrewFont,
          uiFont,
          imagePath,
        });

    texturePromise
      .then((tex) => {
        if (mounted) {
          setTexture(tex);
        }
      })
      .catch((error) => {
        console.error('Failed to create label texture:', error);
      });

    return () => {
      mounted = false;
      // Note: texture disposal is handled in the component cleanup below
      // We don't dispose here because texture is from the previous render
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
  ]);

  // Dispose previous texture when component unmounts or texture changes
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

  // Calculate scale accounting for CSS scaling strategy
  const scaleArray = Array.isArray(scale) ? scale : [scale, scale];

  // For large cards with images, we render at 600x675 but display at 800x900
  const displayAspectRatio = width / height;

  const finalScale: [number, number, number] = [
    scaleArray[0] * displayAspectRatio,
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
