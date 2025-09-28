// src/utils/texture-atlas.ts
import * as THREE from 'three';

export interface AtlasRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  // UV coordinates for this region
  u1: number; // left
  v1: number; // top
  u2: number; // right
  v2: number; // bottom
}

export interface AtlasMapping {
  texture: THREE.Texture;
  regions: Record<string, AtlasRegion>;
}

export interface AtlasConfig {
  atlasWidth: number;
  atlasHeight: number;
  padding: number; // Padding between textures to prevent bleeding
}

/**
 * Packs multiple canvas textures into a single atlas texture
 * Uses simple bin packing algorithm for optimal space usage
 */
export function createTextureAtlas(
  canvases: Record<string, HTMLCanvasElement>,
  config: AtlasConfig = { atlasWidth: 2048, atlasHeight: 2048, padding: 2 }
): AtlasMapping {
  const { atlasWidth, atlasHeight, padding } = config;

  // Create atlas canvas
  const atlasCanvas = document.createElement('canvas');
  atlasCanvas.width = atlasWidth;
  atlasCanvas.height = atlasHeight;
  const atlasCtx = atlasCanvas.getContext('2d');

  if (!atlasCtx) {
    throw new Error('Could not get atlas canvas context');
  }

  // Clear atlas canvas
  atlasCtx.clearRect(0, 0, atlasWidth, atlasHeight);

  const regions: Record<string, AtlasRegion> = {};
  const packedRects: { x: number; y: number; width: number; height: number }[] = [];

  // Simple bin packing - sort by height descending for better packing
  const entries = Object.entries(canvases).sort(
    ([, a], [, b]) => b.height - a.height
  );

  for (const [id, canvas] of entries) {
    const width = canvas.width;
    const height = canvas.height;

    // Find a position for this texture using simple left-to-right, top-to-bottom packing
    const position = findAtlasPosition(
      width + padding * 2,
      height + padding * 2,
      packedRects,
      atlasWidth,
      atlasHeight
    );

    if (!position) {
      console.warn(`Could not fit texture ${id} (${width}x${height}) in atlas`);
      continue;
    }

    // Add padding to the actual position
    const x = position.x + padding;
    const y = position.y + padding;

    // Draw the canvas to the atlas
    atlasCtx.drawImage(canvas, x, y, width, height);

    // Calculate UV coordinates (WebGL UV space: 0,0 = bottom-left, 1,1 = top-right)
    const u1 = x / atlasWidth;
    const v1 = 1 - (y + height) / atlasHeight; // Flip V coordinate
    const u2 = (x + width) / atlasWidth;
    const v2 = 1 - y / atlasHeight; // Flip V coordinate

    regions[id] = {
      x,
      y,
      width,
      height,
      u1,
      v1,
      u2,
      v2,
    };

    // Track this rect for future packing
    packedRects.push({
      x: position.x,
      y: position.y,
      width: width + padding * 2,
      height: height + padding * 2,
    });
  }

  // Create Three.js texture from atlas
  const texture = new THREE.CanvasTexture(atlasCanvas);
  texture.needsUpdate = true;
  texture.flipY = false; // We handle Y-flipping in UV calculation
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;

  return { texture, regions };
}

/**
 * Simple bin packing algorithm to find position for a rectangle
 */
function findAtlasPosition(
  width: number,
  height: number,
  packedRects: { x: number; y: number; width: number; height: number }[],
  atlasWidth: number,
  atlasHeight: number
): { x: number; y: number } | null {
  // Try positions from top-left
  for (let y = 0; y <= atlasHeight - height; y += 1) {
    for (let x = 0; x <= atlasWidth - width; x += 1) {
      const candidate = { x, y, width, height };

      // Check if this position overlaps with any existing rect
      const overlaps = packedRects.some(rect =>
        candidate.x < rect.x + rect.width &&
        candidate.x + candidate.width > rect.x &&
        candidate.y < rect.y + rect.height &&
        candidate.y + candidate.height > rect.y
      );

      if (!overlaps) {
        return { x, y };
      }
    }
  }

  return null; // Could not find position
}

/**
 * Create multiple atlases if textures don't fit in one
 */
export function createMultipleAtlases(
  canvases: Record<string, HTMLCanvasElement>,
  config: AtlasConfig = { atlasWidth: 2048, atlasHeight: 2048, padding: 2 }
): AtlasMapping[] {
  const atlases: AtlasMapping[] = [];
  const remaining = { ...canvases };

  while (Object.keys(remaining).length > 0) {
    const atlas = createTextureAtlas(remaining, config);
    atlases.push(atlas);

    // Remove successfully packed textures
    for (const id of Object.keys(atlas.regions)) {
      delete remaining[id];
    }

    // If no textures were packed in this iteration, break to avoid infinite loop
    if (Object.keys(atlas.regions).length === 0) {
      console.warn('Could not pack remaining textures:', Object.keys(remaining));
      break;
    }
  }

  return atlases;
}

/**
 * Optimized canvas creation for B&W images with alpha
 * Uses more efficient memory layout for LUMINANCE_ALPHA format
 */
export function createOptimizedCanvas(
  width: number,
  height: number,
  isBlackAndWhite: boolean = false
): {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  getOptimizedImageData?: () => Uint8Array;
} {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  let getOptimizedImageData: (() => Uint8Array) | undefined;

  if (isBlackAndWhite) {
    // Provide method to extract LUMINANCE_ALPHA data
    getOptimizedImageData = () => {
      const imageData = ctx.getImageData(0, 0, width, height);
      const rgba = imageData.data;
      const luminanceAlpha = new Uint8Array(width * height * 2);

      for (let i = 0; i < rgba.length; i += 4) {
        const luminance = rgba[i]; // R channel (since it's B&W, R=G=B)
        const alpha = rgba[i + 3]; // A channel
        const laIndex = (i / 4) * 2;

        luminanceAlpha[laIndex] = luminance;
        luminanceAlpha[laIndex + 1] = alpha;
      }

      return luminanceAlpha;
    };
  }

  return { canvas, ctx, getOptimizedImageData };
}

/**
 * Check if RG format is supported (WebGL2 or EXT_texture_rg extension)
 */
function supportsRGFormat(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (gl) return true; // WebGL2 supports RG format

    const gl1 = canvas.getContext('webgl');
    if (gl1) {
      const ext = gl1.getExtension('EXT_texture_rg');
      return ext !== null;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Create a Three.js texture from alpha mask data for memory efficiency
 */
export function createAlphaMaskTexture(
  data: Uint8Array,
  width: number,
  height: number
): THREE.DataTexture {
  const hasRGSupport = supportsRGFormat();

  const finalData = data;
  let format: THREE.PixelFormat;

  if (hasRGSupport) {
    format = THREE.RGFormat;
  } else {
    // Use LuminanceAlpha format for WebGL1 compatibility (preserves both channels, 2 bytes/pixel)
    // Note: LuminanceAlphaFormat was removed from Three.js, using raw WebGL constant
    format = 0x190A as THREE.PixelFormat; // WebGL LUMINANCE_ALPHA constant
  }

  const texture = new THREE.DataTexture(
    finalData,
    width,
    height,
    format,
    THREE.UnsignedByteType
  );

  texture.needsUpdate = true;
  texture.flipY = false;
  texture.magFilter = THREE.LinearFilter;

  // Check if texture dimensions are power of two
  const isPowerOfTwo = (width & (width - 1)) === 0 && (height & (height - 1)) === 0;

  if (isPowerOfTwo) {
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.generateMipmaps = true;
  } else {
    // NPOT textures: disable mipmaps for WebGL1 compatibility
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
  }

  return texture;
}