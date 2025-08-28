// src/components/mother-labels.tsx
import * as React from 'react';
import * as THREE from 'three';
import { axes } from '../data/geometry';
import { Label3D } from './label3d';
import { getSpec } from '../data/label-spec';
import { useAxisFacingQuaternion } from '../utils/orientation';
import { MOTHER_OFFSET, UP } from '../data/constants';

function parts(letter: import('../data/label-spec').HebrewLetter) {
  const d = getSpec(letter);
  return {
    title: `Key ${d.keyNumber} – ${d.keyName}`,
    glyph: d.letterChar,
    subtitle: `${d.letterName} — ${d.association.value}`,
  };
}

export function MotherLabels(): React.JSX.Element {
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
  const h0 = horizontals[0],
    h1 = horizontals[1];

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

        const Node = ({ pos }: { pos: [number, number, number] }) => {
          const ref = React.useRef<THREE.Group>(null!);
          const lp = parts(a.letter);
          useAxisFacingQuaternion(ref, pos, [t.x, t.y, t.z], flipRef, a.normal);
          return (
            <group ref={ref} position={pos}>
              <Label3D
                title={lp.title}
                subtitle={lp.subtitle}
                hebrewLetter={lp.glyph}
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
