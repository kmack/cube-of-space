// src/components/edge-labels.tsx
import * as React from 'react';
import { edges } from '../data/geometry';
import { eulerFromNormalAndTangent } from '../utils/orientation';
import { RichLabel } from './rich-label';
import { getSpec } from '../data/label-spec';
import { EDGE_LABEL_BACKGROUND, LABEL_SCALE } from '../data/label-styles';
import { LABEL_OFFSET } from '../data/constants';
import { getTarotImagePath } from '../utils/tarot-images';
import type { HebrewLetter } from '../data/label-spec';

type LabelParts = {
  title: string;
  glyph: string;
  subtitle: string;
};

function labelParts(letter: HebrewLetter): LabelParts & { imagePath: string } {
  const d = getSpec(letter);
  return {
    title: `Key ${d.keyNumber} – ${d.keyName}`,
    glyph: d.letterChar,
    subtitle: `${d.letterName} — ${d.association.value}`,
    imagePath: getTarotImagePath(d.keyNumber),
  };
}

export function EdgeLabels(): React.JSX.Element {
  return (
    <>
      {edges.map((e, i) => {
        const rot = eulerFromNormalAndTangent(e.normal, e.tangent);
        const lp = labelParts(e.letter);
        // Calculate offset position - push label outward from center along edge normal
        const offsetPos: [number, number, number] = [
          e.pos[0] + (e.pos[0] > 0 ? LABEL_OFFSET : e.pos[0] < 0 ? -LABEL_OFFSET : 0),
          e.pos[1] + (e.pos[1] > 0 ? LABEL_OFFSET : e.pos[1] < 0 ? -LABEL_OFFSET : 0),
          e.pos[2] + (e.pos[2] > 0 ? LABEL_OFFSET : e.pos[2] < 0 ? -LABEL_OFFSET : 0),
        ];
        return (
          <group key={i} position={offsetPos} rotation={rot}>
            <RichLabel
              title={lp.title}
              subtitle={lp.subtitle}
              hebrewLetter={lp.glyph}
              imagePath={lp.imagePath}
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
