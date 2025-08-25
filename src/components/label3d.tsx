// src/components/label3d.tsx
import { Text } from "@react-three/drei";
import * as React from "react";

export type Label3DProps = {
  title: string;
  subtitle?: string;
  glyph?: string;
  hebrewFont?: string;
  size?: number;
  gap?: number;
  color?: string;
};

export function Label3D({
  title,
  subtitle,
  glyph,
  hebrewFont = "/fonts/ShlomoStam.ttf",
  size = 0.08,
  gap = 0.08,
  color = "white",
}: Label3DProps): React.JSX.Element {
  const titleSize = size;
  const glyphSize = size * 1.25;
  const subSize = size * 0.85;

  const titleLH = 1.1,
    glyphLH = 1.0,
    subLH = 1.0;
  const hTitle = (titleSize * titleLH) / 2;
  const hGlyph = glyph ? (glyphSize * glyphLH) / 2 : 0;
  const hSub = subtitle ? (subSize * subLH) / 2 : 0;

  const gGlyph = glyph ? gap : 0;
  const gSub = subtitle ? gap : 0;

  const totalHalf =
    hTitle + (glyph ? gGlyph + hGlyph : 0) + (subtitle ? gSub + hSub : 0);

  const yTitle = totalHalf - hTitle;
  const yGlyph = glyph ? yTitle - (hTitle + gGlyph + hGlyph) : 0;
  const ySub = subtitle
    ? glyph
      ? yGlyph - (hGlyph + gSub + hSub)
      : yTitle - (hTitle + gSub + hSub)
    : 0;

  return (
    <group>
      <Text
        anchorX="center"
        anchorY="middle"
        fontSize={titleSize}
        lineHeight={titleLH}
        color={color}
        material-toneMapped={false}
      >
        {title}
      </Text>
      {glyph && (
        <Text
          anchorX="center"
          anchorY="middle"
          position={[0, yGlyph, 0]}
          font={hebrewFont}
          fontSize={glyphSize}
          color={color}
          material-toneMapped={false}
        >
          {glyph}
        </Text>
      )}
      {subtitle && (
        <Text
          anchorX="center"
          anchorY="middle"
          position={[0, ySub, 0]}
          fontSize={subSize}
          color={color}
          material-toneMapped={false}
          material-transparent
          material-opacity={0.9}
        >
          {subtitle}
        </Text>
      )}
    </group>
  );
}
