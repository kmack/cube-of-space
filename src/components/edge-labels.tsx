// src/components/edge-labels.tsx
import * as React from 'react';
import { edges } from '../data/geometry';
import { eulerFromNormalAndTangent } from '../utils/orientation';
import { RichLabel } from './rich-label';
import { getSpec } from '../data/label-spec';
import { EDGE_LABEL_BACKGROUND, LABEL_SCALE } from '../data/label-styles';
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

export function EdgeLabels(): React.JSX.Element {
  return (
    <>
      {edges.map((e, i) => {
        const rot = eulerFromNormalAndTangent(e.normal, e.tangent);
        const lp = labelParts(e.letter);
        return (
          <group key={i} position={e.pos} rotation={rot}>
            <RichLabel
              title={lp.title}
              subtitle={lp.subtitle}
              hebrewLetter={lp.glyph}
              scale={LABEL_SCALE}
              background={EDGE_LABEL_BACKGROUND}
              hebrewFont="FrankRuhlLibre, serif"
              uiFont="Inter, sans-serif"
            />
          </group>
        );
      })}
    </>
  );
}
