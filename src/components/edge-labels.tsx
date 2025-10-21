// src/components/edge-labels.tsx
import * as React from 'react';

import { edges } from '../data/geometry';
import { EDGE_LABEL_BACKGROUND, LABEL_SCALE } from '../data/label-styles';
import { createLabelData } from '../utils/label-factory';
import type { BaseLabelProps } from '../utils/label-utils';
import { calculateAxisAlignedOffset, LABEL_FONTS } from '../utils/label-utils';
import { eulerFromNormalAndTangent } from '../utils/orientation';
import { RichLabel } from './rich-label';

type EdgeLabelsProps = BaseLabelProps;

function EdgeLabelsComponent({
  useMemoryOptimization = true,
  doubleSided = false,
  showColorBorders = true,
}: EdgeLabelsProps): React.JSX.Element {
  // Memoize edge label data and positions to avoid recalculation
  const edgeLabelInfo = React.useMemo(() => {
    return edges.map((e) => {
      const rot = eulerFromNormalAndTangent(e.normal, e.tangent);
      const labelData = createLabelData(e.letter);
      // Calculate offset position - push label outward from center along edge normal
      const offsetPos = calculateAxisAlignedOffset(e.pos);
      return { labelData, offsetPos, rotation: rot };
    });
  }, []);

  return (
    <>
      {edgeLabelInfo.map((info, i) => {
        return (
          <group key={i} position={info.offsetPos} rotation={info.rotation}>
            <RichLabel
              title={info.labelData.title}
              subtitle={info.labelData.subtitle}
              hebrewLetter={info.labelData.glyph}
              letterName={info.labelData.letterName}
              assocGlyph={info.labelData.assocGlyph}
              assocName={info.labelData.assocName}
              colorName={info.labelData.color}
              colorValue={info.labelData.colorValue}
              note={info.labelData.note}
              significance={info.labelData.significance}
              gematria={info.labelData.gematria}
              alchemy={info.labelData.alchemy}
              showColorBorders={showColorBorders}
              imagePath={info.labelData.imagePath}
              scale={LABEL_SCALE}
              background={EDGE_LABEL_BACKGROUND}
              hebrewFont={LABEL_FONTS.hebrew}
              uiFont={LABEL_FONTS.ui}
              useMemoryOptimization={useMemoryOptimization}
              doubleSided={doubleSided}
            />
          </group>
        );
      })}
    </>
  );
}

// Memoize component to prevent unnecessary re-renders
export const EdgeLabels = React.memo(EdgeLabelsComponent);
