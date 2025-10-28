/**
 * @fileoverview Global constants including cube dimensions, colors keyed by Tarot
 * numbers, and font paths for Hebrew and UI text rendering.
 */

// src/data/constants.ts
import * as THREE from 'three';

export const SIZE = 2;
export const HALF = SIZE / 2;
export const MOTHER_OFFSET = SIZE * 0.18;
export const LABEL_OFFSET = 0.02; // Distance to move labels away from cube center
export const EDGE_POSITION_LABEL_OFFSET = 0.5; // Distance to move edge position labels away from cube center
export const UP = new THREE.Vector3(0, 1, 0);
export const UI_FONT = '/fonts/Inter-VariableFont_opsz,wght.ttf';
export const HEBREW_FONT = '/fonts/FrankRuhlLibre-VariableFont_wght.ttf';
export const SYMBOL_FONT = '/fonts/NotoSansSymbols2-Regular.ttf';
export const ALCHEMY_FONT = '/fonts/Symbola-AjYx.ttf';

// Face colors keyed by Tarot key number (B.O.T.A.)
export const FACE_COLOR_BY_KEY: Record<string, string> = {
  '1': '#ffd500', // Above  (Beth, Key 1)    Yellow
  '2': '#3b7cff', // Below  (Gimel, Key 2)   Blue
  '3': '#2ec27e', // East   (Daleth, Key 3)  Green
  '10': '#8a63ff', // West   (Kaph, Key 10)   Purple
  '16': '#ff4d4f', // North  (Peh, Key 16)    Red
  '19': '#ff9a1f', // South  (Resh, Key 19)   Orange
};

// Line colors
export const AXIS_LINE_COLOR = '#88ccff';
export const DIAGONAL_LINE_COLOR = '#4d4d4d';

// Label canvas dimensions
export const LABEL_WIDTH_WITH_IMAGE = 900;
export const LABEL_HEIGHT_WITH_IMAGE = 800;
export const LABEL_WIDTH_NO_IMAGE = 512;
export const LABEL_HEIGHT_NO_IMAGE = 320;
