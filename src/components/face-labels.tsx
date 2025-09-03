// src/components/face-labels.tsx
import * as React from 'react';
import { faces, center } from '../data/geometry';
import { Label3D } from './label3d';
import { getSpec } from '../data/label-spec';
import type { HebrewLetter } from '../data/label-spec';

type LabelParts = {
  title: string;
  glyph: string;
  subtitle: string;
};

function labelParts(letter: HebrewLetter): LabelParts {
  const d = getSpec(letter);
  return {
    title: `Key ${d.keyNumber} – ${d.keyName}`,
    glyph: d.letterChar,
    subtitle: `${d.letterName} — ${d.association.value}`,
  };
}

export function FaceLabels(): React.JSX.Element {
  return (
    <>
      {[...faces, center].map((f, i) => {
        const lp = labelParts(f.letter);
        return (
          <group key={i} position={f.pos} rotation={f.rotation}>
            <Label3D
              title={lp.title}
              subtitle={lp.subtitle}
              hebrewLetter={lp.glyph}
            />
          </group>
        );
      })}
    </>
  );
}
