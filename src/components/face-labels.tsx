// src/components/face-labels.tsx
import * as React from 'react';
import { Billboard } from '@react-three/drei';
import { faces, center } from '../data/geometry';
import { RichLabel } from './rich-label';
import { FACE_LABEL_BACKGROUND, LABEL_SCALE } from '../data/label-styles';
import { LABEL_OFFSET } from '../data/constants';
import { createLabelData } from '../utils/label-factory';


export function FaceLabels(): React.JSX.Element {
  const centerLabelData = createLabelData(center.letter);

  return (
    <>
      {/* Regular face labels */}
      {faces.map((f, i) => {
        const labelData = createLabelData(f.letter);
        // Calculate offset position - push label outward from center along face normal
        const offsetPos: [number, number, number] = [
          f.pos[0] + (f.pos[0] > 0 ? LABEL_OFFSET : f.pos[0] < 0 ? -LABEL_OFFSET : 0),
          f.pos[1] + (f.pos[1] > 0 ? LABEL_OFFSET : f.pos[1] < 0 ? -LABEL_OFFSET : 0),
          f.pos[2] + (f.pos[2] > 0 ? LABEL_OFFSET : f.pos[2] < 0 ? -LABEL_OFFSET : 0),
        ];
        return (
          <group key={i} position={offsetPos} rotation={f.rotation}>
            <RichLabel
              title={labelData.title}
              subtitle={labelData.subtitle}
              hebrewLetter={labelData.glyph}
              imagePath={labelData.imagePath}
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
          title={centerLabelData.title}
          subtitle={centerLabelData.subtitle}
          hebrewLetter={centerLabelData.glyph}
          imagePath={centerLabelData.imagePath}
          scale={LABEL_SCALE}
          background={FACE_LABEL_BACKGROUND}
          hebrewFont="FrankRuhlLibre, serif"
          uiFont="Inter, sans-serif"
        />
      </Billboard>
    </>
  );
}
