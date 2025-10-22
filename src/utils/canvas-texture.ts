// src/utils/canvas-texture.ts
import * as THREE from 'three';

import {
  LABEL_HEIGHT_NO_IMAGE,
  LABEL_HEIGHT_WITH_IMAGE,
  LABEL_WIDTH_NO_IMAGE,
  LABEL_WIDTH_WITH_IMAGE,
} from '../data/constants';
import { createAlphaMaskTexture, createOptimizedCanvas } from './texture-atlas';

/**
 * Module-level image cache to avoid repeated loading and decoding
 */
const imageCache = new Map<string, Promise<HTMLImageElement>>();

export type TextStyle = {
  fontSize: number;
  fontFamily: string;
  color: string;
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
  fontWeight?: string;
  opacity?: number;
};

export type BackgroundStyle = {
  color?: string;
  opacity?: number;
  borderRadius?: number;
  padding?: number;
  border?: {
    width: number;
    color: string;
  };
};

export type ImageConfig = {
  src: string;
  width: number;
  height: number;
  x: number;
  y: number;
  // Optional source cropping parameters
  sourceX?: number;
  sourceY?: number;
  sourceWidth?: number;
  sourceHeight?: number;
};

export type CanvasLabelConfig = {
  width: number;
  height: number;
  background?: BackgroundStyle;
  texts?: Array<{
    content: string;
    x: number;
    y: number;
    style: TextStyle;
  }>;
  images?: ImageConfig[];
  devicePixelRatio?: number;
  // Memory optimization options
  useOptimizedFormat?: boolean; // Use LUMINANCE_ALPHA for B&W images
  targetResolution?: { width: number; height: number }; // Render at lower res for upscaling
  // Cancellation support
  signal?: AbortSignal; // Allow cancellation of async texture creation
};

/**
 * Creates a canvas texture with rich content (text + images)
 * Supports cancellation via AbortSignal for proper cleanup on component unmount
 */
export function createCanvasTexture(
  config: CanvasLabelConfig
): Promise<THREE.CanvasTexture | THREE.DataTexture> {
  return new Promise((resolve, reject) => {
    // Check if already aborted before starting
    if (config.signal?.aborted) {
      const error = new Error('Texture creation aborted');
      error.name = 'AbortError';
      reject(error);
      return;
    }

    // Set up abort listener for true cancellation
    const abortHandler = (): void => {
      const error = new Error('Texture creation aborted');
      error.name = 'AbortError';
      reject(error);
    };
    config.signal?.addEventListener('abort', abortHandler, { once: true });

    // Use target resolution for memory optimization if specified
    const renderWidth = config.targetResolution?.width ?? config.width;
    const renderHeight = config.targetResolution?.height ?? config.height;

    // Determine if this is a B&W image based on content
    const isBlackAndWhite =
      config.useOptimizedFormat ??
      (config.images?.some((img) => img.src.includes('major-arcana')) &&
        (!config.background?.color ||
          config.background.color === 'transparent'));

    const { canvas, ctx, getOptimizedImageData } = createOptimizedCanvas(
      renderWidth,
      renderHeight,
      isBlackAndWhite
    );

    const dpr = config.devicePixelRatio ?? window.devicePixelRatio ?? 1;

    // Set canvas dimensions with device pixel ratio for crisp rendering
    canvas.width = renderWidth * dpr;
    canvas.height = renderHeight * dpr;
    canvas.style.width = `${renderWidth}px`;
    canvas.style.height = `${renderHeight}px`;

    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, renderWidth, renderHeight);

    // Calculate scale factors for target resolution rendering
    const scaleX = renderWidth / config.width;
    const scaleY = renderHeight / config.height;

    // Draw background if specified
    if (config.background) {
      drawBackground(ctx, config.background, renderWidth, renderHeight);
    }

    // Load and draw images, then draw text
    loadImages(config.images ?? [], config.signal)
      .then((loadedImages) => {
        // Clean up abort listener on success
        config.signal?.removeEventListener('abort', abortHandler);
        // Draw images with scaling
        loadedImages.forEach((img, index) => {
          // eslint-disable-next-line security/detect-object-injection -- index is loop counter, safe array access
          const imgConfig = config.images![index];

          if (
            imgConfig.sourceX !== undefined &&
            imgConfig.sourceY !== undefined &&
            imgConfig.sourceWidth !== undefined &&
            imgConfig.sourceHeight !== undefined
          ) {
            // Draw with source cropping and scaling
            ctx.drawImage(
              img,
              imgConfig.sourceX,
              imgConfig.sourceY,
              imgConfig.sourceWidth,
              imgConfig.sourceHeight, // Source crop
              imgConfig.x * scaleX,
              imgConfig.y * scaleY,
              imgConfig.width * scaleX,
              imgConfig.height * scaleY // Destination scaled
            );
          } else {
            // Draw entire image with scaling
            ctx.drawImage(
              img,
              imgConfig.x * scaleX,
              imgConfig.y * scaleY,
              imgConfig.width * scaleX,
              imgConfig.height * scaleY
            );
          }
        });

        // Draw text elements with scaling
        config.texts?.forEach((textConfig) => {
          const scaledStyle = {
            ...textConfig.style,
            fontSize: textConfig.style.fontSize * Math.min(scaleX, scaleY),
          };
          drawText(
            ctx,
            textConfig.content,
            textConfig.x * scaleX,
            textConfig.y * scaleY,
            scaledStyle
          );
        });

        // Create optimized texture based on format
        if (isBlackAndWhite && getOptimizedImageData) {
          try {
            const luminanceData = getOptimizedImageData();
            const texture = createAlphaMaskTexture(
              luminanceData,
              renderWidth,
              renderHeight
            );
            resolve(texture);
          } catch (error) {
            // Fallback to regular canvas texture if optimization fails
            console.warn(
              'Failed to create optimized texture, falling back to canvas texture:',
              error
            );
            const texture = new THREE.CanvasTexture(canvas);
            texture.needsUpdate = true;
            texture.flipY = false;

            // Set proper filter settings for upscaling shader compatibility
            texture.magFilter = THREE.LinearFilter;

            // Check if texture dimensions are power of two for mipmap support
            const isPowerOfTwo =
              (canvas.width & (canvas.width - 1)) === 0 &&
              (canvas.height & (canvas.height - 1)) === 0;

            if (isPowerOfTwo) {
              texture.minFilter = THREE.LinearMipmapLinearFilter;
              texture.generateMipmaps = true;
            } else {
              texture.minFilter = THREE.LinearFilter;
              texture.generateMipmaps = false;
            }

            resolve(texture);
          }
        } else {
          // Create regular canvas texture
          const texture = new THREE.CanvasTexture(canvas);
          texture.needsUpdate = true;
          texture.flipY = false;

          // Set proper filter settings for consistency
          texture.magFilter = THREE.LinearFilter;

          // Check if texture dimensions are power of two for mipmap support
          const isPowerOfTwo =
            (canvas.width & (canvas.width - 1)) === 0 &&
            (canvas.height & (canvas.height - 1)) === 0;

          if (isPowerOfTwo) {
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.generateMipmaps = true;
          } else {
            texture.minFilter = THREE.LinearFilter;
            texture.generateMipmaps = false;
          }

          resolve(texture);
        }
      })
      .catch((error: unknown) => {
        // Clean up abort listener on error
        config.signal?.removeEventListener('abort', abortHandler);
        // Ensure error is properly typed as Error
        const wrappedError =
          error instanceof Error
            ? error
            : new Error(
                `Texture creation failed: ${error instanceof Object ? JSON.stringify(error) : String(error)}`
              );
        reject(wrappedError);
      });
  });
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  bg: BackgroundStyle,
  width: number,
  height: number
): void {
  if (bg.color) {
    ctx.save();
    if (bg.opacity !== undefined) {
      ctx.globalAlpha = bg.opacity;
    }

    if (bg.borderRadius) {
      // Draw rounded rectangle
      const padding = bg.padding ?? 0;
      const radius = bg.borderRadius;

      ctx.beginPath();
      ctx.roundRect(
        padding,
        padding,
        width - 2 * padding,
        height - 2 * padding,
        radius
      );
      ctx.fillStyle = bg.color;
      ctx.fill();

      // Draw border if specified
      if (bg.border) {
        ctx.strokeStyle = bg.border.color;
        ctx.lineWidth = bg.border.width;
        ctx.stroke();
      }
    } else {
      // Simple rectangle
      ctx.fillStyle = bg.color;
      ctx.fillRect(0, 0, width, height);
    }

    ctx.restore();
  }
}

function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  style: TextStyle
): void {
  ctx.save();

  // Apply text styles
  ctx.font = `${style.fontWeight ?? 'normal'} ${style.fontSize}px ${style.fontFamily}`;
  ctx.fillStyle = style.color;
  ctx.textAlign = style.textAlign ?? 'center';
  ctx.textBaseline = style.textBaseline ?? 'middle';
  ctx.globalAlpha = style.opacity ?? 1;

  // Draw text
  ctx.fillText(text, x, y);

  ctx.restore();
}

async function loadImages(
  imageConfigs: ImageConfig[],
  signal?: AbortSignal
): Promise<HTMLImageElement[]> {
  if (imageConfigs.length === 0) {
    return [];
  }

  // Check if already aborted
  if (signal?.aborted) {
    const error = new Error('Image loading aborted');
    error.name = 'AbortError';
    throw error;
  }

  const promises = imageConfigs.map((config) => {
    // Check cache first
    if (imageCache.has(config.src)) {
      return imageCache.get(config.src)!;
    }

    // Create and cache the promise with abort support
    const imagePromise = new Promise<HTMLImageElement>((resolve, reject) => {
      if (signal?.aborted) {
        const error = new Error('Image loading aborted');
        error.name = 'AbortError';
        reject(error);
        return;
      }

      const img = new Image();

      // Set up abort handler
      const abortHandler = (): void => {
        img.src = ''; // Cancel image loading
        const error = new Error('Image loading aborted');
        error.name = 'AbortError';
        reject(error);
      };
      signal?.addEventListener('abort', abortHandler, { once: true });

      img.onload = () => {
        signal?.removeEventListener('abort', abortHandler);
        resolve(img);
      };
      img.onerror = () => {
        signal?.removeEventListener('abort', abortHandler);
        const error = new Error(`Failed to load image: ${config.src}`);
        error.name = 'ImageLoadError';
        reject(error);
      };
      img.src = config.src;
    });

    imageCache.set(config.src, imagePromise);
    return imagePromise;
  });

  return Promise.all(promises);
}

/**
 * Helper function to create a structured Hebrew label texture with separate components
 */
export function createStructuredHebrewLabel(
  hebrewLetter: string,
  letterName: string,
  assocGlyph: string,
  assocName: string,
  title: string,
  options: {
    width?: number;
    height?: number;
    hebrewFont?: string;
    uiFont?: string;
    symbolFont?: string;
    color?: string;
    background?: BackgroundStyle;
    imagePath?: string;
    useMemoryOptimization?: boolean;
    signal?: AbortSignal;
    // Additional correspondence fields
    colorName?: string;
    colorValue?: string;
    note?: string;
    significance?: string;
    gematria?: number;
    alchemy?: string;
    showColorBorders?: boolean;
  } = {}
): Promise<THREE.CanvasTexture | THREE.DataTexture> {
  const useOptimization = options.useMemoryOptimization !== false;
  const width =
    options.width ??
    (options.imagePath ? LABEL_WIDTH_WITH_IMAGE : LABEL_WIDTH_NO_IMAGE);
  const height =
    options.height ??
    (options.imagePath ? LABEL_HEIGHT_WITH_IMAGE : LABEL_HEIGHT_NO_IMAGE);
  const targetWidth = useOptimization ? Math.min(width, 600) : width;
  const targetHeight = useOptimization ? Math.min(height, 480) : height;
  const color = options.color ?? 'white';
  const hebrewFont = options.hebrewFont ?? 'FrankRuhlLibre, serif';
  const uiFont = options.uiFont ?? 'Inter, sans-serif';
  const symbolFont = options.symbolFont ?? '"Symbola", "Noto Sans Symbols 2"';

  // Use the background as-is from options - border styling is now handled at component level
  const background: BackgroundStyle | undefined = options.background;

  const texts: CanvasLabelConfig['texts'] = [];
  const images: ImageConfig[] = [];

  const hasBlackWhiteImage = !!options.imagePath?.includes('major-arcana');
  const hasTransparentBackground =
    !background?.color || background.color === 'transparent';

  if (options.imagePath) {
    // Tarot card layout
    const sourceWidth = 416 - 96;
    const sourceHeight = 512 - 0;
    const aspectRatio = sourceWidth / sourceHeight;
    const cardHeight = height - 190; // Increased margin to make room for correspondence fields
    const cardWidth = Math.floor(cardHeight * aspectRatio);
    const cardX = (width - cardWidth) / 2;
    const cardY = 80;

    images.push({
      src: options.imagePath,
      x: cardX,
      y: cardY,
      width: cardWidth,
      height: cardHeight,
      sourceX: 96,
      sourceY: 0,
      sourceWidth: sourceWidth,
      sourceHeight: sourceHeight,
    });

    // Title above the card
    texts.push({
      content: title,
      x: width / 2,
      y: 40,
      style: {
        fontSize: 32,
        fontFamily: uiFont,
        color,
        textAlign: 'center',
        textBaseline: 'middle',
        fontWeight: '600',
      },
    });

    // Below card layout: Hebrew letter/name aligned to left edge, attribution aligned to right edge
    const belowCardY = cardY + cardHeight + 45;
    const hebrewSize = 48;
    const glyphNameGap = 10; // spacing between glyph and name
    const cardLeftEdge = cardX;
    const cardRightEdge = cardX + cardWidth;

    // Hebrew letter |ה| - aligned to left edge of card
    texts.push({
      content: hebrewLetter,
      x: cardLeftEdge,
      y: belowCardY,
      style: {
        fontSize: hebrewSize,
        fontFamily: hebrewFont,
        color,
        textAlign: 'left',
        textBaseline: 'middle',
        opacity: 0.95,
      },
    });

    // Letter name: "Heh" - positioned after Hebrew letter
    texts.push({
      content: letterName,
      x: cardLeftEdge + hebrewSize + 10,
      y: belowCardY,
      style: {
        fontSize: 24,
        fontFamily: uiFont,
        color,
        textAlign: 'left',
        textBaseline: 'middle',
        opacity: 0.9,
      },
    });

    // Association glyph: ♈ - right-aligned to right edge of card
    texts.push({
      content: assocGlyph,
      x: cardRightEdge,
      y: belowCardY,
      style: {
        fontSize: hebrewSize,
        fontFamily: `${symbolFont}, ${hebrewFont}`,
        color,
        textAlign: 'right',
        textBaseline: 'middle',
        opacity: 0.95,
      },
    });

    // Association name: "Aries" - positioned before glyph
    texts.push({
      content: assocName,
      x: cardRightEdge - hebrewSize - glyphNameGap,
      y: belowCardY,
      style: {
        fontSize: 24,
        fontFamily: uiFont,
        color,
        textAlign: 'right',
        textBaseline: 'middle',
        opacity: 0.9,
      },
    });

    // Additional correspondences in lower-right corner block
    if (
      options.colorName ||
      options.note ||
      options.significance ||
      options.gematria !== undefined ||
      options.alchemy
    ) {
      const lineHeight = 40; // Line spacing (doubled)
      // Double the spacing from label border to rounded rectangle
      const paddingValue = background?.padding ?? 2;
      const rightMargin = paddingValue * 2.5; // Distance from right edge
      const bottomMargin = paddingValue * 2; // Distance from bottom edge

      // Build correspondence strings (compact format)
      const correspondences: string[] = [];

      if (options.colorName && options.colorValue) {
        correspondences.push(`${options.colorName}`);
      }
      if (options.gematria !== undefined) {
        correspondences.push(`Gematria: ${options.gematria}`);
      }
      if (options.note) {
        correspondences.push(`${options.note}`);
      }
      if (options.significance) {
        correspondences.push(`${options.significance}`);
      }
      if (options.alchemy) {
        correspondences.push(`${options.alchemy}`);
      }

      // Position in lower-right corner, stacked vertically from bottom up
      const blockHeight = correspondences.length * lineHeight;
      const startY = height - bottomMargin - blockHeight + lineHeight / 2;

      correspondences.forEach((text, index) => {
        texts.push({
          content: text,
          x: width - rightMargin,
          y: startY + index * lineHeight,
          style: {
            fontSize: 30, // Doubled from 15
            fontFamily: uiFont,
            color,
            textAlign: 'right', // Right-aligned for lower-right corner
            textBaseline: 'middle',
            opacity: 0.75,
          },
        });
      });
    }
  } else {
    // Centered layout without image
    let currentY = 70;

    // Hebrew letter (larger)
    texts.push({
      content: hebrewLetter,
      x: width / 2,
      y: currentY,
      style: {
        fontSize: 64,
        fontFamily: hebrewFont,
        color,
        textAlign: 'center',
        textBaseline: 'middle',
      },
    });

    currentY += 85;

    // Title
    texts.push({
      content: title,
      x: width / 2,
      y: currentY,
      style: {
        fontSize: 28,
        fontFamily: uiFont,
        color,
        textAlign: 'center',
        textBaseline: 'middle',
        fontWeight: '500',
      },
    });

    currentY += 50;

    // Subtitle line: |ה| Heh — ♈ Aries
    const hebrewSize = 32;
    const spacing = 8;

    // Calculate total width for centering
    const letterNameWidth = letterName.length * 14; // approximate
    const assocNameWidth = assocName.length * 14;
    const totalWidth =
      hebrewSize +
      spacing +
      letterNameWidth +
      30 +
      hebrewSize +
      spacing +
      assocNameWidth;
    const startX = (width - totalWidth) / 2;

    let xPos = startX;

    // Hebrew letter
    texts.push({
      content: hebrewLetter,
      x: xPos + hebrewSize / 2,
      y: currentY,
      style: {
        fontSize: hebrewSize,
        fontFamily: hebrewFont,
        color,
        textAlign: 'center',
        textBaseline: 'middle',
      },
    });
    xPos += hebrewSize + spacing;

    // Letter name
    texts.push({
      content: letterName,
      x: xPos,
      y: currentY,
      style: {
        fontSize: 22,
        fontFamily: uiFont,
        color,
        textAlign: 'left',
        textBaseline: 'middle',
        opacity: 0.9,
      },
    });
    xPos += letterNameWidth + 30;

    // Association glyph
    texts.push({
      content: assocGlyph,
      x: xPos + hebrewSize / 2,
      y: currentY,
      style: {
        fontSize: hebrewSize,
        fontFamily: `${symbolFont}, ${hebrewFont}`,
        color,
        textAlign: 'center',
        textBaseline: 'middle',
      },
    });
    xPos += hebrewSize + spacing;

    // Association name
    texts.push({
      content: assocName,
      x: xPos,
      y: currentY,
      style: {
        fontSize: 22,
        fontFamily: uiFont,
        color,
        textAlign: 'left',
        textBaseline: 'middle',
        opacity: 0.9,
      },
    });
  }

  return createCanvasTexture({
    width,
    height,
    background,
    texts,
    images,
    useOptimizedFormat:
      useOptimization && hasBlackWhiteImage && hasTransparentBackground,
    targetResolution: useOptimization
      ? { width: targetWidth, height: targetHeight }
      : undefined,
    signal: options.signal,
  });
}

/**
 * Helper function to create a standard Hebrew label texture matching your current format
 */
export function createHebrewLabelTexture(
  hebrewLetter: string,
  title: string,
  subtitle?: string,
  options: {
    width?: number;
    height?: number;
    hebrewFont?: string;
    uiFont?: string;
    color?: string;
    background?: BackgroundStyle;
    imagePath?: string;
    useMemoryOptimization?: boolean;
    signal?: AbortSignal;
  } = {}
): Promise<THREE.CanvasTexture | THREE.DataTexture> {
  // Apply memory optimization defaults
  const useOptimization = options.useMemoryOptimization !== false; // Default to true
  const width = options.width ?? (options.imagePath ? 900 : 512); // Target display size
  const height = options.height ?? (options.imagePath ? 800 : 320); // Target display size

  // Reduce render resolution for memory optimization while maintaining aspect ratio
  const targetWidth = useOptimization ? Math.min(width, 600) : width;
  const targetHeight = useOptimization ? Math.min(height, 480) : height;
  const color = options.color ?? 'white';
  const hebrewFont = options.hebrewFont ?? 'FrankRuhlLibre, serif';
  const uiFont = options.uiFont ?? 'Inter, sans-serif';

  const texts: CanvasLabelConfig['texts'] = [];
  const images: ImageConfig[] = [];

  // Determine if this is a B&W image for LUMINANCE_ALPHA optimization
  const hasBlackWhiteImage = !!options.imagePath?.includes('major-arcana');
  const hasTransparentBackground =
    !options.background?.color || options.background.color === 'transparent';

  if (options.imagePath) {
    // Source image crop area (x96-x416 = 320px wide, y0-y512 = 512px tall)
    const sourceWidth = 416 - 96; // 320px
    const sourceHeight = 512 - 0; // 512px
    const aspectRatio = sourceWidth / sourceHeight; // 320/512 = 0.625

    // Calculate card size - much larger now, taking up most of the canvas
    const cardHeight = height - 160; // Reserve space for title above and subtitle below
    const cardWidth = Math.floor(cardHeight * aspectRatio);
    const cardX = (width - cardWidth) / 2; // Center horizontally
    const cardY = 80; // Position below title area

    // Large centered Tarot card
    images.push({
      src: options.imagePath,
      x: cardX,
      y: cardY,
      width: cardWidth,
      height: cardHeight,
      // Crop parameters for the relevant portion of the source image
      sourceX: 96,
      sourceY: 0,
      sourceWidth: sourceWidth,
      sourceHeight: sourceHeight,
    });

    // Title above the card
    texts.push({
      content: title,
      x: width / 2,
      y: 40,
      style: {
        fontSize: 32,
        fontFamily: uiFont,
        color,
        textAlign: 'center',
        textBaseline: 'middle',
        fontWeight: '600',
      },
    });

    // Hebrew letter and subtitle below the card
    const belowCardY = cardY + cardHeight + 40;

    // Hebrew letter (left side below card)
    texts.push({
      content: hebrewLetter,
      x: width / 2 - 60,
      y: belowCardY,
      style: {
        fontSize: 32,
        fontFamily: hebrewFont,
        color,
        textAlign: 'center',
        textBaseline: 'middle',
        opacity: 0.9,
      },
    });

    // Subtitle (right side below card, next to Hebrew letter)
    if (subtitle) {
      texts.push({
        content: subtitle,
        x: width / 2 + 60,
        y: belowCardY,
        style: {
          fontSize: 22,
          fontFamily: `${uiFont}, "Symbola", "Noto Sans Symbols 2", sans-serif`,
          color,
          textAlign: 'center',
          textBaseline: 'middle',
          opacity: 0.8,
        },
      });
    }
  } else {
    // Original centered layout for labels without images
    let currentY = 60;

    // Hebrew letter
    texts.push({
      content: hebrewLetter,
      x: width / 2,
      y: currentY,
      style: {
        fontSize: 48,
        fontFamily: hebrewFont,
        color,
        textAlign: 'center',
        textBaseline: 'middle',
      },
    });

    currentY += 70;

    // Title
    texts.push({
      content: title,
      x: width / 2,
      y: currentY,
      style: {
        fontSize: 28,
        fontFamily: uiFont,
        color,
        textAlign: 'center',
        textBaseline: 'middle',
        fontWeight: '500',
      },
    });

    currentY += 45;

    // Subtitle (if provided)
    if (subtitle) {
      texts.push({
        content: subtitle,
        x: width / 2,
        y: currentY,
        style: {
          fontSize: 20,
          fontFamily: `${uiFont}, "Symbola", "Noto Sans Symbols 2", sans-serif`,
          color,
          textAlign: 'center',
          textBaseline: 'middle',
          opacity: 0.9,
        },
      });
    }
  }

  return createCanvasTexture({
    width,
    height,
    background: options.background,
    texts,
    images,
    // Memory optimization settings
    useOptimizedFormat:
      useOptimization && hasBlackWhiteImage && hasTransparentBackground,
    targetResolution: useOptimization
      ? { width: targetWidth, height: targetHeight }
      : undefined,
    signal: options.signal,
  });
}
