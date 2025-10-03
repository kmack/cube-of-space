// src/components/diagonal-labels.tsx
import * as React from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { diagonals } from '../data/geometry';
import { RichLabel } from './rich-label';
import { LABEL_SCALE } from '../data/label-styles';
import { createLabelData } from '../utils/label-factory';
import type { CanvasLabelConfig } from '../utils/canvas-texture';

interface DiagonalLabelsProps {
  useMemoryOptimization?: boolean;
}

export function DiagonalLabels({
  useMemoryOptimization = true,
}: DiagonalLabelsProps): React.JSX.Element {
  return (
    <>
      {diagonals.map((d, i) => {
        const labelData = createLabelData(d.letter);

        // Balanced memory optimization for iOS Safari - crisp rendering at small size
        const canvasConfig: CanvasLabelConfig = {
          width: 128,
          height: 32,
          // Higher resolution texture for crisp rendering, but still small
          targetResolution: {
            width: 128,
            height: 32,
          },
          useOptimizedFormat: false, // Must use RGBA for proper transparency
          devicePixelRatio: 1, // Force 1x to prevent memory explosion on iOS
          background: {
            color: 'rgba(96, 96, 96, 0.4)',
            borderRadius: 2,
            padding: 2,
            border: {
              width: 1,
              color: 'rgba(255, 255, 255, 0.8)',
            },
          },
          texts: [
            {
              content: labelData.glyph,
              x: 16,
              y: 16,
              style: {
                fontSize: 18,
                fontFamily: 'FrankRuhlLibre, serif',
                color: 'white',
                textAlign: 'center',
                textBaseline: 'middle',
              },
            },
            {
              content: labelData.letterName,
              x: 40,
              y: 16,
              style: {
                fontSize: 12,
                fontFamily: 'Inter, sans-serif',
                color: 'white',
                textAlign: 'left',
                textBaseline: 'middle',
              },
            },
          ],
        };

        const DiagonalLabel = (): React.JSX.Element => {
          const ref = React.useRef<THREE.Group>(null!);

          // Reusable objects to prevent memory allocation every frame
          const tempObjects = React.useRef({
            worldPos: new THREE.Vector3(),
            toCamera: new THREE.Vector3(),
            tangent: new THREE.Vector3(...d.tangent).normalize(),
            normal: new THREE.Vector3(),
            binormal: new THREE.Vector3(),
            matrix: new THREE.Matrix4(),
          });

          // Simple billboard behavior for diagonal labels
          useFrame(({ camera }) => {
            if (!ref.current) return;

            const tmp = tempObjects.current;

            ref.current.getWorldPosition(tmp.worldPos);

            // Get direction from label to camera
            tmp.toCamera.copy(camera.position).sub(tmp.worldPos).normalize();

            // Project camera direction onto plane perpendicular to diagonal
            const dot = tmp.toCamera.dot(tmp.tangent);
            tmp.normal
              .copy(tmp.toCamera)
              .addScaledVector(tmp.tangent, -dot)
              .normalize();

            // Binormal (up direction for the label)
            tmp.binormal.crossVectors(tmp.normal, tmp.tangent).normalize();

            // Ensure binormal points generally upward
            if (tmp.binormal.y < 0) {
              tmp.binormal.multiplyScalar(-1);
              tmp.tangent.multiplyScalar(-1);
            }

            // Build rotation matrix and apply
            tmp.matrix.makeBasis(tmp.tangent, tmp.binormal, tmp.normal);
            ref.current.quaternion.setFromRotationMatrix(tmp.matrix);

            // Reset tangent for next frame (in case it was flipped)
            tmp.tangent
              .set(d.tangent[0], d.tangent[1], d.tangent[2])
              .normalize();
          });

          // Cleanup textures on unmount to prevent memory leaks on iOS
          React.useEffect(() => {
            // Capture ref at mount time for cleanup
            const groupElement = ref.current;

            return () => {
              if (groupElement) {
                groupElement.traverse((child) => {
                  if (child instanceof THREE.Mesh) {
                    const material = child.material;
                    if (material instanceof THREE.Material) {
                      // Dispose texture if it exists
                      const meshMaterial = material as THREE.MeshBasicMaterial;
                      if (
                        meshMaterial.map &&
                        meshMaterial.map instanceof THREE.Texture
                      ) {
                        meshMaterial.map.dispose();
                      }
                      material.dispose();
                    }
                    if (
                      child.geometry &&
                      child.geometry instanceof THREE.BufferGeometry
                    ) {
                      child.geometry.dispose();
                    }
                  }
                });
              }
            };
          }, []);

          return (
            <group ref={ref} position={d.pos}>
              <RichLabel
                title=""
                canvasConfig={canvasConfig}
                width={128}
                height={32}
                scale={LABEL_SCALE * 0.075}
                useMemoryOptimization={useMemoryOptimization}
              />
            </group>
          );
        };

        return <DiagonalLabel key={i} />;
      })}
    </>
  );
}
