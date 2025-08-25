// src/data/constants.ts
import * as THREE from "three";

export const SIZE = 2;
export const HALF = SIZE / 2;
export const MOTHER_OFFSET = SIZE * 0.18;
export const UP = new THREE.Vector3(0, 1, 0);

// Face colors keyed by Tarot key number (B.O.T.A.)
export const FACE_COLOR_BY_KEY: Record<string, string> = {
  "1": "#ffd500", // Above  (Beth, Key 1)    Yellow
  "2": "#3b7cff", // Below  (Gimel, Key 2)   Blue
  "3": "#2ec27e", // East   (Daleth, Key 3)  Green
  "10": "#8a63ff", // West   (Kaph, Key 10)   Purple
  "16": "#ff4d4f", // North  (Peh, Key 16)    Red
  "19": "#ff9a1f", // South  (Resh, Key 19)   Orange
};
