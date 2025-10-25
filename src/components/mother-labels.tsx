// src/components/mother-labels.tsx
import { useFrame } from '@react-three/fiber';
import * as React from 'react';
import * as THREE from 'three';

import { MOTHER_OFFSET, UP } from '../data/constants';
import { axes } from '../data/geometry';
import { LABEL_SCALE, MOTHER_LABEL_BACKGROUND } from '../data/label-styles';
import { createLabelData } from '../utils/label-factory';
import {
  LabelPositioningStrategyFactory,
  LabelPositioningUtils,
} from '../utils/label-positioning';
import type { AnimatedLabelProps } from '../utils/label-utils';
import { useAxisFacingQuaternion } from '../utils/orientation';
import { StandardRichLabel } from './standard-rich-label';

type MotherLabelsProps = AnimatedLabelProps;

// Move Node component outside to prevent unmount/remount on parent re-renders
const MotherLabelNode = React.memo(
  ({
    pos,
    axisInfo,
    flipRef,
    useMemoryOptimization,
    doubleSided,
    showColorBorders,
    isAnimationActive,
    isMobile,
  }: {
    pos: [number, number, number];
    axisInfo: { a: (typeof axes)[0]; t: THREE.Vector3 };
    flipRef: [number, number, number] | undefined;
    useMemoryOptimization: boolean;
    doubleSided: boolean;
    showColorBorders: boolean;
    isAnimationActive: boolean;
    isMobile: boolean;
  }): React.JSX.Element => {
    const { a, t } = axisInfo;
    const ref = React.useRef<THREE.Group>(null!);
    const frameCountRef = React.useRef(0);
    const isInitializedRef = React.useRef(false);
    const labelData = createLabelData(a.letter);

    // Create positioning strategy based on axis letter
    // Aleph (vertical) uses dynamic camera-based positioning
    // Mem/Shin (horizontal) use static upward offset
    const positioningStrategy = React.useMemo(
      () => LabelPositioningStrategyFactory.createStrategy(a.letter),
      [a.letter]
    );

    // Dynamic positioning using strategy pattern
    useFrame(({ camera }) => {
      if (!ref.current) return;

      // Calculate position using the appropriate strategy
      const finalPos = LabelPositioningUtils.calculateFramePosition(
        pos,
        positioningStrategy,
        camera
      );

      // Always initialize position on first frame
      if (!isInitializedRef.current) {
        ref.current.position.set(...finalPos);
        isInitializedRef.current = true;
        return; // Skip the rest of the frame to avoid double update
      }

      // Only update position when active (save battery when idle)
      if (!isAnimationActive) return;

      // Throttle to 30fps on mobile (skip every other frame)
      if (isMobile) {
        frameCountRef.current++;
        if (frameCountRef.current % 2 !== 0) return;
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
        <StandardRichLabel
          labelData={labelData}
          scale={LABEL_SCALE}
          background={MOTHER_LABEL_BACKGROUND}
          useMemoryOptimization={useMemoryOptimization}
          doubleSided={doubleSided}
          showColorBorders={showColorBorders}
        />
      </group>
    );
  }
);

MotherLabelNode.displayName = 'MotherLabelNode';

function MotherLabelsComponent({
  useMemoryOptimization = true,
  doubleSided = false,
  showColorBorders = true,
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

        return (
          <React.Fragment key={idx}>
            <MotherLabelNode
              pos={fromPos}
              axisInfo={{ a, t }}
              flipRef={flipRef}
              useMemoryOptimization={useMemoryOptimization}
              doubleSided={doubleSided}
              showColorBorders={showColorBorders}
              isAnimationActive={isAnimationActive}
              isMobile={isMobile}
            />
            <MotherLabelNode
              pos={toPos}
              axisInfo={{ a, t }}
              flipRef={flipRef}
              useMemoryOptimization={useMemoryOptimization}
              doubleSided={doubleSided}
              showColorBorders={showColorBorders}
              isAnimationActive={isAnimationActive}
              isMobile={isMobile}
            />
          </React.Fragment>
        );
      })}
    </>
  );
}

export const MotherLabels = React.memo(MotherLabelsComponent);
