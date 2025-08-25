// src/utils/types.ts
import type { HebrewLetter } from "../data/label-spec";

export type Vec3 = [number, number, number];

export type Face = {
  letter: HebrewLetter;
  pos: Vec3;
  rotation: Vec3;
};

export type Edge = {
  letter: HebrewLetter;
  pos: Vec3;
  normal: Vec3; // plane normal
  tangent: Vec3; // text baseline direction
};

export type Axis = {
  letter: HebrewLetter;
  from: Vec3;
  to: Vec3;
  pos: Vec3; // label position
  normal: Vec3; // preferred out direction
  tangent: Vec3; // along-axis direction
};
