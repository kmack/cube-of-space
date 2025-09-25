// src/utils/canvas-texture.ts
import * as THREE from 'three';

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
};

/**
 * Creates a canvas texture with rich content (text + images)
 */
export function createCanvasTexture(
  config: CanvasLabelConfig
): Promise<THREE.CanvasTexture> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    const dpr = config.devicePixelRatio || window.devicePixelRatio || 1;

    // Set canvas dimensions with device pixel ratio for crisp rendering
    canvas.width = config.width * dpr;
    canvas.height = config.height * dpr;
    canvas.style.width = `${config.width}px`;
    canvas.style.height = `${config.height}px`;

    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, config.width, config.height);

    // Draw background if specified
    if (config.background) {
      drawBackground(ctx, config.background, config.width, config.height);
    }

    // Load and draw images, then draw text
    loadImages(config.images || [])
      .then((loadedImages) => {
        // Draw images
        loadedImages.forEach((img, index) => {
          const imgConfig = config.images![index];

          if (
            imgConfig.sourceX !== undefined &&
            imgConfig.sourceY !== undefined &&
            imgConfig.sourceWidth !== undefined &&
            imgConfig.sourceHeight !== undefined
          ) {
            // Draw with source cropping
            ctx.drawImage(
              img,
              imgConfig.sourceX,
              imgConfig.sourceY,
              imgConfig.sourceWidth,
              imgConfig.sourceHeight, // Source crop
              imgConfig.x,
              imgConfig.y,
              imgConfig.width,
              imgConfig.height // Destination
            );
          } else {
            // Draw entire image
            ctx.drawImage(
              img,
              imgConfig.x,
              imgConfig.y,
              imgConfig.width,
              imgConfig.height
            );
          }
        });

        // Draw text elements
        config.texts?.forEach((textConfig) => {
          drawText(
            ctx,
            textConfig.content,
            textConfig.x,
            textConfig.y,
            textConfig.style
          );
        });

        // Create and return texture
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        texture.flipY = false; // Prevent text from being flipped
        resolve(texture);
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
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = config.src;
    });
  });

  return Promise.all(promises);
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
  } = {}
): Promise<THREE.CanvasTexture> {
  const width = options.width || (options.imagePath ? 800 : 512); // Optimal width for vertical layout
  const height = options.height || (options.imagePath ? 900 : 320); // Taller canvas for vertical layout
  const color = options.color || 'white';
  const hebrewFont = options.hebrewFont || 'FrankRuhlLibre, serif';
  const uiFont = options.uiFont || 'Inter, sans-serif';

  const texts: CanvasLabelConfig['texts'] = [];
  const images: ImageConfig[] = [];

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
          fontFamily: uiFont,
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
          fontFamily: uiFont,
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
  });
}
