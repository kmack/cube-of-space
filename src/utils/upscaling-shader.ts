// src/utils/upscaling-shader.ts
import * as THREE from 'three';

/**
 * High-quality upscaling shader material using bicubic interpolation
 * Provides better quality than linear filtering for upscaled textures
 */
export class UpscalingMaterial extends THREE.ShaderMaterial {
  constructor(texture: THREE.Texture, _targetAspectRatio: number = 1) {
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform sampler2D map;
      uniform vec2 textureSize;
      uniform float sharpness;
      uniform bool useBicubic;
      varying vec2 vUv;

      // Bicubic interpolation function
      float cubic(float x) {
        float x2 = x * x;
        float x3 = x2 * x;
        if (x < 1.0) {
          return (1.5 * x3 - 2.5 * x2 + 1.0);
        } else if (x < 2.0) {
          return (-0.5 * x3 + 2.5 * x2 - 4.0 * x + 2.0);
        }
        return 0.0;
      }

      vec4 bicubicSample(sampler2D tex, vec2 uv, vec2 texSize) {
        vec2 pixel = uv * texSize - 0.5;
        vec2 floorPixel = floor(pixel);
        vec2 fracPixel = pixel - floorPixel;

        vec4 result = vec4(0.0);
        float totalWeight = 0.0;

        for (int y = -1; y <= 2; y++) {
          for (int x = -1; x <= 2; x++) {
            vec2 samplePos = (floorPixel + vec2(float(x), float(y)) + 0.5) / texSize;

            // Clamp to texture bounds
            samplePos = clamp(samplePos, vec2(0.0), vec2(1.0));

            float weightX = cubic(abs(float(x) - fracPixel.x));
            float weightY = cubic(abs(float(y) - fracPixel.y));
            float weight = weightX * weightY;

            result += texture2D(tex, samplePos) * weight;
            totalWeight += weight;
          }
        }

        return result / totalWeight;
      }

      // Enhanced linear interpolation with sharpening
      vec4 enhancedLinear(sampler2D tex, vec2 uv) {
        vec4 color = texture2D(tex, uv);

        // Apply unsharp mask for better perceived quality
        vec2 texelSize = 1.0 / textureSize;
        vec4 blur = (
          texture2D(tex, uv + vec2(-texelSize.x, -texelSize.y)) +
          texture2D(tex, uv + vec2(0.0, -texelSize.y)) +
          texture2D(tex, uv + vec2(texelSize.x, -texelSize.y)) +
          texture2D(tex, uv + vec2(-texelSize.x, 0.0)) +
          texture2D(tex, uv + vec2(texelSize.x, 0.0)) +
          texture2D(tex, uv + vec2(-texelSize.x, texelSize.y)) +
          texture2D(tex, uv + vec2(0.0, texelSize.y)) +
          texture2D(tex, uv + vec2(texelSize.x, texelSize.y))
        ) / 8.0;

        vec4 sharpened = color + (color - blur) * sharpness;
        return clamp(sharpened, 0.0, 1.0);
      }

      void main() {
        vec4 color;

        if (useBicubic) {
          color = bicubicSample(map, vUv, textureSize);
        } else {
          color = enhancedLinear(map, vUv);
        }

        gl_FragColor = color;
      }
    `;

    super({
      uniforms: {
        map: { value: texture },
        textureSize: { value: new THREE.Vector2(texture.image?.width || 512, texture.image?.height || 512) },
        sharpness: { value: 0.3 }, // Subtle sharpening
        useBicubic: { value: true }, // Use bicubic by default for better quality
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      side: THREE.BackSide, // Match existing RichLabel behavior
      toneMapped: false,
      depthWrite: false, // Prevent depth buffer writes for proper transparency
    });

    // Update texture size when texture changes
    this.onBeforeRender = () => {
      if (texture.image) {
        this.uniforms.textureSize.value.set(texture.image.width, texture.image.height);
      }
    };
  }

  /**
   * Update the sharpness level (0 = no sharpening, 1 = maximum sharpening)
   */
  setSharpness(value: number): void {
    this.uniforms.sharpness.value = Math.max(0, Math.min(1, value));
  }

  /**
   * Toggle between bicubic and enhanced linear interpolation
   */
  setBicubic(enabled: boolean): void {
    this.uniforms.useBicubic.value = enabled;
  }
}

/**
 * Creates an optimized material for upscaling textures
 * Falls back to regular material if WebGL2 is not available
 */
export function createUpscalingMaterial(
  texture: THREE.Texture,
  options: {
    sharpness?: number;
    useBicubic?: boolean;
    fallbackToBasic?: boolean;
  } = {}
): THREE.Material {
  const { sharpness = 0.3, useBicubic = true, fallbackToBasic = false } = options;

  // Check WebGL capabilities
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

  if (!gl || fallbackToBasic) {
    // Fallback to basic material with optimized settings
    return new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.BackSide,
      toneMapped: false,
      depthWrite: false,
    });
  }

  try {
    const material = new UpscalingMaterial(texture);
    material.setSharpness(sharpness);
    material.setBicubic(useBicubic);
    return material;
  } catch (error) {
    console.warn('Failed to create upscaling shader, using basic material:', error);
    return new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.BackSide,
      toneMapped: false,
      depthWrite: false,
    });
  }
}

/**
 * Utility to determine optimal sharpness based on upscaling factor
 */
export function calculateOptimalSharpness(
  sourceResolution: { width: number; height: number },
  targetResolution: { width: number; height: number }
): number {
  const scaleX = targetResolution.width / sourceResolution.width;
  const scaleY = targetResolution.height / sourceResolution.height;
  const avgScale = (scaleX + scaleY) / 2;

  // More sharpening for higher upscaling factors
  if (avgScale >= 2.0) return 0.5;
  if (avgScale >= 1.5) return 0.3;
  if (avgScale >= 1.2) return 0.2;
  return 0.1;
}