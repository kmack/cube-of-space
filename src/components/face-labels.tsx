// src/components/face-labels.tsx
import * as React from 'react';
import { faces, center } from '../data/geometry';
import { RichLabel } from './rich-label';
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
            <RichLabel
              title={lp.title}
              subtitle={lp.subtitle}
              hebrewLetter={lp.glyph}
              scale={0.375} // Reduced to 0.75 of previous scale
              background={{
                color: 'rgba(96, 96, 96, 0.4)',
                opacity: 0.45,
                borderRadius: 8,
                padding: 12,
                border: {
                  width: 1,
                  color: 'rgba(255, 255, 255, 0.8)',
                },
              }}
              hebrewFont="FrankRuhlLibre, serif"
              uiFont="Inter, sans-serif"
            />
          </group>
        );
      })}
    </>
  );
}
