// src/components/label3d.tsx
import { Text } from '@react-three/drei';
import * as React from 'react';
import { HEBREW_FONT, UI_FONT } from '../data/constants';

export type Label3DProps = {
  title: string;
  subtitle?: string;
  hebrewLetter?: string;
  hebrewFont?: string;
  size?: number;
  gap?: number;
  color?: string;
};

export function Label3D({
  title,
  subtitle,
  hebrewLetter: hebrewLetter,
  size = 0.08,
  gap = 0.08,
  color = 'white',
}: Label3DProps): React.JSX.Element {
  const titleSize = size;
  const hebrewLetterSize = size * 1.25;
  const subSize = size * 0.85;

  const titleLH = 1.1;
  const hebrewLetterLH = 1.0;
  const subLH = 1.0;
  const hTitle = (titleSize * titleLH) / 2;
  const hHebrewLetter = hebrewLetter
    ? (hebrewLetterSize * hebrewLetterLH) / 2
    : 0;
  const hSub = subtitle ? (subSize * subLH) / 2 : 0;

  const gHebrewLetter = hebrewLetter ? gap : 0;
  const gSub = subtitle ? gap : 0;

  const totalHalf =
    hTitle +
    (hebrewLetter ? gHebrewLetter + hHebrewLetter : 0) +
    (subtitle ? gSub + hSub : 0);

  const yTitle = totalHalf - hTitle;
  const yHebrewLetter = hebrewLetter
    ? yTitle - (hTitle + gHebrewLetter + hHebrewLetter)
    : 0;
  const ySub = subtitle
    ? hebrewLetter
      ? yHebrewLetter - (hHebrewLetter + gSub + hSub)
      : yTitle - (hTitle + gSub + hSub)
    : 0;

  return (
    <group>
      {hebrewLetter && (
        <Text
          anchorX="center"
          anchorY="middle"
          position={[0, yHebrewLetter, 0]}
          font={HEBREW_FONT}
          fontSize={hebrewLetterSize}
          color={color}
          material-toneMapped={false}
          sdfGlyphSize={16}
        >
          {hebrewLetter}
        </Text>
      )}
      <Text
        anchorX="center"
        anchorY="middle"
        font={UI_FONT}
        fontSize={titleSize}
        lineHeight={titleLH}
        color={color}
        material-toneMapped={false}
        sdfGlyphSize={16}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          anchorX="center"
          anchorY="middle"
          font={UI_FONT}
          position={[0, ySub, 0]}
          fontSize={subSize}
          color={color}
          material-toneMapped={false}
          material-transparent
          material-opacity={0.9}
          sdfGlyphSize={16}
        >
          {subtitle}
        </Text>
      )}
    </group>
  );
}
