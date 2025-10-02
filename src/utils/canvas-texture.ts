// src/utils/canvas-texture.ts
import * as THREE from 'three';
import { createOptimizedCanvas, createAlphaMaskTexture } from './texture-atlas';

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
};

/**
 * Creates a canvas texture with rich content (text + images)
 */
export function createCanvasTexture(
  config: CanvasLabelConfig
): Promise<THREE.CanvasTexture | THREE.DataTexture> {
  return new Promise((resolve, reject) => {
    // Use target resolution for memory optimization if specified
    const renderWidth = config.targetResolution?.width || config.width;
    const renderHeight = config.targetResolution?.height || config.height;

    // Determine if this is a B&W image based on content
    const isBlackAndWhite =
      config.useOptimizedFormat ||
      (config.images?.some((img) => img.src.includes('major-arcana')) &&
        (!config.background?.color ||
          config.background.color === 'transparent'));

    const { canvas, ctx, getOptimizedImageData } = createOptimizedCanvas(
      renderWidth,
      renderHeight,
      isBlackAndWhite
    );

    const dpr = config.devicePixelRatio || window.devicePixelRatio || 1;

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
    loadImages(config.images || [])
      .then((loadedImages) => {
        // Draw images with scaling
        loadedImages.forEach((img, index) => {
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
      .catch(reject);
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
    ctx.globalAlpha = bg.opacity ?? 1;

    if (bg.borderRadius) {
      // Draw rounded rectangle
      const padding = bg.padding || 0;
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
  ctx.font = `${style.fontWeight || 'normal'} ${style.fontSize}px ${style.fontFamily}`;
  ctx.fillStyle = style.color;
  ctx.textAlign = style.textAlign || 'center';
  ctx.textBaseline = style.textBaseline || 'middle';
  ctx.globalAlpha = style.opacity ?? 1;

  // Draw text
  ctx.fillText(text, x, y);

  ctx.restore();
}

async function loadImages(
  imageConfigs: ImageConfig[]
): Promise<HTMLImageElement[]> {
  if (imageConfigs.length === 0) {
    return [];
  }

  const promises = imageConfigs.map((config) => {
    // Check cache first
    if (imageCache.has(config.src)) {
      return imageCache.get(config.src)!;
    }

    // Create and cache the promise
    const imagePromise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
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
  } = {}
): Promise<THREE.CanvasTexture | THREE.DataTexture> {
  const useOptimization = options.useMemoryOptimization !== false;
  const width = options.width || (options.imagePath ? 900 : 512);
  const height = options.height || (options.imagePath ? 800 : 320);
  const targetWidth = useOptimization ? Math.min(width, 600) : width;
  const targetHeight = useOptimization ? Math.min(height, 480) : height;
  const color = options.color || 'white';
  const hebrewFont = options.hebrewFont || 'FrankRuhlLibre, serif';
  const uiFont = options.uiFont || 'Inter, sans-serif';
  const symbolFont = options.symbolFont || '"Symbola", "Noto Sans Symbols 2"';

  const texts: CanvasLabelConfig['texts'] = [];
  const images: ImageConfig[] = [];

  const hasBlackWhiteImage = !!options.imagePath?.includes('major-arcana');
  const hasTransparentBackground =
    !options.background?.color || options.background.color === 'transparent';

  if (options.imagePath) {
    // Tarot card layout
    const sourceWidth = 416 - 96;
    const sourceHeight = 512 - 0;
    const aspectRatio = sourceWidth / sourceHeight;
    const cardHeight = height - 160;
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

    // Below card layout: |Hebrew| LetterName    |Glyph| AssocName
    const belowCardY = cardY + cardHeight + 45;
    const hebrewSize = 48;
    const spacing = 12; // consistent spacing between glyph and name

    // Hebrew letter |ה|
    texts.push({
      content: hebrewLetter,
      x: width / 2 - 180,
      y: belowCardY,
      style: {
        fontSize: hebrewSize,
        fontFamily: hebrewFont,
        color,
        textAlign: 'center',
        textBaseline: 'middle',
        opacity: 0.95,
      },
    });

    // Letter name: "Heh"
    texts.push({
      content: letterName,
      x: width / 2 - 180 + 40,
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

    // Association glyph: ♈
    texts.push({
      content: assocGlyph,
      x: width / 2 + 60,
      y: belowCardY,
      style: {
        fontSize: hebrewSize,
        fontFamily: `${symbolFont}, ${hebrewFont}`,
        color,
        textAlign: 'center',
        textBaseline: 'middle',
        opacity: 0.95,
      },
    });

    // Association name: "Aries"
    texts.push({
      content: assocName,
      x: width / 2 + 60 + 40,
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
    const totalWidth = hebrewSize + spacing + letterNameWidth + 30 + hebrewSize + spacing + assocNameWidth;
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
    background: options.background,
    texts,
    images,
    useOptimizedFormat:
      useOptimization && hasBlackWhiteImage && hasTransparentBackground,
    targetResolution: useOptimization
      ? { width: targetWidth, height: targetHeight }
      : undefined,
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
  } = {}
): Promise<THREE.CanvasTexture | THREE.DataTexture> {
  // Apply memory optimization defaults
  const useOptimization = options.useMemoryOptimization !== false; // Default to true
  const width = options.width || (options.imagePath ? 900 : 512); // Target display size
  const height = options.height || (options.imagePath ? 800 : 320); // Target display size

  // Reduce render resolution for memory optimization while maintaining aspect ratio
  const targetWidth = useOptimization ? Math.min(width, 600) : width;
  const targetHeight = useOptimization ? Math.min(height, 480) : height;
  const color = options.color || 'white';
  const hebrewFont = options.hebrewFont || 'FrankRuhlLibre, serif';
  const uiFont = options.uiFont || 'Inter, sans-serif';

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
  });
}
