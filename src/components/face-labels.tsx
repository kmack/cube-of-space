// src/components/face-labels.tsx
import * as React from 'react';
import { Billboard } from '@react-three/drei';
import { faces, center } from '../data/geometry';
import { RichLabel } from './rich-label';
import { getSpec } from '../data/label-spec';
import { FACE_LABEL_BACKGROUND, LABEL_SCALE } from '../data/label-styles';
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

export function FaceLabels(): React.JSX.Element {
  const centerLp = labelParts(center.letter);

  return (
    <>
      {/* Regular face labels */}
      {faces.map((f, i) => {
        const lp = labelParts(f.letter);
        return (
          <group key={i} position={f.pos} rotation={f.rotation}>
            <RichLabel
              title={lp.title}
              subtitle={lp.subtitle}
              hebrewLetter={lp.glyph}
              imagePath={lp.imagePath}
              scale={LABEL_SCALE}
              background={FACE_LABEL_BACKGROUND}
              hebrewFont="FrankRuhlLibre, serif"
              uiFont="Inter, sans-serif"
            />
          </group>
        );
      })}

      {/* Center label as billboard - always faces viewer */}
      <Billboard
        follow={true}
        lockX={false}
        lockY={false}
        lockZ={false}
        position={center.pos}
      >
        <RichLabel
          title={centerLp.title}
          subtitle={centerLp.subtitle}
          hebrewLetter={centerLp.glyph}
          imagePath={centerLp.imagePath}
          scale={LABEL_SCALE}
          background={FACE_LABEL_BACKGROUND}
          hebrewFont="FrankRuhlLibre, serif"
          uiFont="Inter, sans-serif"
        />
      </Billboard>
    </>
  );
}
