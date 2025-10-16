// src/components/mother-labels.tsx
import { useFrame } from '@react-three/fiber';
import * as React from 'react';
import * as THREE from 'three';

import { LABEL_OFFSET, MOTHER_OFFSET, UP } from '../data/constants';
import { axes } from '../data/geometry';
import { LABEL_SCALE, MOTHER_LABEL_BACKGROUND } from '../data/label-styles';
import { createLabelData } from '../utils/label-factory';
import { useAxisFacingQuaternion } from '../utils/orientation';
import { RichLabel } from './rich-label';

interface MotherLabelsProps {
  useMemoryOptimization?: boolean;
  doubleSided?: boolean;
  isAnimationActive?: boolean;
  isMobile?: boolean;
}

function MotherLabelsComponent({
  useMemoryOptimization = true,
  doubleSided = false,
  isAnimationActive = true,
  isMobile = false,
}: MotherLabelsProps): React.JSX.Element {
  // Find the two horizontal mother axes to use as flip references (Mem/Shin)
  const info = axes.map((a, idx) => {
    const t = new THREE.Vector3(
      a.to[0] - a.from[0],
      a.to[1] - a.from[1],
      a.to[2] - a.from[2]
    ).normalize();
    const horizontal = Math.abs(t.dot(UP)) < 0.95;
    return { idx, a, t, horizontal };
  });
  const horizontals = info.filter((i) => i.horizontal);
  const h0 = horizontals[0];
  const h1 = horizontals[1];

  return (
    <>
      {info.map(({ idx, a, t, horizontal }) => {
        const fromPos: [number, number, number] = [
          a.from[0] + t.x * MOTHER_OFFSET,
          a.from[1] + t.y * MOTHER_OFFSET,
          a.from[2] + t.z * MOTHER_OFFSET,
        ];
        const toPos: [number, number, number] = [
          a.to[0] - t.x * MOTHER_OFFSET,
          a.to[1] - t.y * MOTHER_OFFSET,
          a.to[2] - t.z * MOTHER_OFFSET,
        ];
        const flipRef: [number, number, number] | undefined =
          horizontal && h0 && h1
            ? idx === h0.idx
              ? [h1.t.x, h1.t.y, h1.t.z]
              : idx === h1.idx
                ? [h0.t.x, h0.t.y, h0.t.z]
                : undefined
            : undefined;

        const Node = ({
          pos,
        }: {
          pos: [number, number, number];
        }): React.JSX.Element => {
          const ref = React.useRef<THREE.Group>(null!);
          const frameCountRef = React.useRef(0);
          const labelData = createLabelData(a.letter);

          // Calculate axis-specific offset to avoid z-fighting with axis lines
          const baseOffsetPos: [number, number, number] = [...pos];
          if (a.letter === 'Mem') {
            // East-West axis (X) - offset upward (positive Y)
            baseOffsetPos[1] += LABEL_OFFSET;
          } else if (a.letter === 'Shin') {
            // North-South axis (Z) - offset upward (positive Y)
            baseOffsetPos[1] += LABEL_OFFSET;
          }

          // Dynamic positioning for all mother letter labels
          useFrame(({ camera }) => {
            if (!ref.current) return;

            // Pause animations when not active (idle or tab hidden)
            if (!isAnimationActive) return;

            // Throttle to 30fps on mobile (skip every other frame)
            if (isMobile) {
              frameCountRef.current++;
              if (frameCountRef.current % 2 !== 0) return;
            }

            let finalPos: [number, number, number];

            if (a.letter === 'Aleph') {
              // Vertical axis (Y) - offset toward camera dynamically
              const labelPos = new THREE.Vector3(...pos);
              const cameraPos = camera.position.clone();
              const toCamera = cameraPos.sub(labelPos).normalize();
              // Project the camera direction onto the horizontal plane (remove Y component)
              toCamera.y = 0;
              toCamera.normalize();

              // Calculate dynamic offset position
              finalPos = [
                pos[0] + toCamera.x * LABEL_OFFSET,
                pos[1],
                pos[2] + toCamera.z * LABEL_OFFSET,
              ];
            } else {
              // Use the pre-calculated base offset position for other axes
              finalPos = baseOffsetPos;
            }

            // Update the group position
            ref.current.position.set(...finalPos);
          });

          useAxisFacingQuaternion(
            ref,
            pos, // Just pass the base position since the hook reads worldPosition anyway
            [t.x, t.y, t.z],
            flipRef,
            a.normal
          );

          return (
            <group ref={ref}>
              <RichLabel
                title={labelData.title}
                subtitle={labelData.subtitle}
                hebrewLetter={labelData.glyph}
                imagePath={labelData.imagePath}
                scale={LABEL_SCALE}
                background={MOTHER_LABEL_BACKGROUND}
                hebrewFont="FrankRuhlLibre, serif"
                uiFont="Inter, sans-serif"
                useMemoryOptimization={useMemoryOptimization}
                doubleSided={doubleSided}
              />
            </group>
          );
        };

        return (
          <React.Fragment key={idx}>
            <Node pos={fromPos} />
            <Node pos={toPos} />
          </React.Fragment>
        );
      })}
    </>
  );
}

export const MotherLabels = React.memo(MotherLabelsComponent);
