// src/data/geometry.ts
import type { Face, Edge, Axis } from '../utils/types';
import { HALF, MOTHER_OFFSET, LABEL_OFFSET } from './constants';

export const faces: Face[] = [
  { letter: 'Beth', pos: [0, +HALF, 0], rotation: [-Math.PI / 2, 0, 0] }, // Above (Mercury)
  { letter: 'Gimel', pos: [0, -HALF, 0], rotation: [Math.PI / 2, 0, 0] }, // Below (Moon)
  { letter: 'Daleth', pos: [+HALF, 0, 0], rotation: [0, Math.PI / 2, 0] }, // East (Venus)
  { letter: 'Kaph', pos: [-HALF, 0, 0], rotation: [0, -Math.PI / 2, 0] }, // West (Jupiter)
  { letter: 'Resh', pos: [0, 0, +HALF], rotation: [0, 0, 0] }, // South (Sun)
  { letter: 'Peh', pos: [0, 0, -HALF], rotation: [0, Math.PI, 0] }, // North (Mars)
];

export const center: Face = {
  letter: 'Tav',
  pos: [0, 0, 0],
  rotation: [0, 0, 0], // Saturn
};

const topY = +HALF;
const botY = -HALF;

const eastX = +HALF;
const westX = -HALF;

const southZ = +HALF;
const northZ = -HALF;

export const edges: Edge[] = [
  // Corner verticals
  {
    letter: 'Heh',
    pos: [eastX, 0, northZ],
    normal: [+1, 0, -1],
    tangent: [0, 1, 0],
  }, // NE
  {
    letter: 'Vav',
    pos: [eastX, 0, southZ],
    normal: [+1, 0, +1],
    tangent: [0, 1, 0],
  }, // SE
  {
    letter: 'Lamed',
    pos: [westX, 0, northZ],
    normal: [-1, 0, -1],
    tangent: [0, 1, 0],
  }, // NW
  {
    letter: 'Nun',
    pos: [westX, 0, southZ],
    normal: [-1, 0, +1],
    tangent: [0, 1, 0],
  }, // SW

  // East face (top/bottom)
  {
    letter: 'Zain',
    pos: [eastX, topY, 0],
    normal: [+1, +1, 0],
    tangent: [0, 0, -1],
  }, // East-Above
  {
    letter: 'Cheth',
    pos: [eastX, botY, 0],
    normal: [+1, -1, 0],
    tangent: [0, 0, -1],
  }, // East-Below (fixed tangent):contentReference[oaicite:3]{index=3}

  // North face (top/bottom)
  {
    letter: 'Teth',
    pos: [0, topY, northZ],
    normal: [0, 1, -1],
    tangent: [-1, 0, 0],
  }, // North-Above
  {
    letter: 'Yod',
    pos: [0, botY, northZ],
    normal: [0, -1, -1],
    tangent: [-1, 0, 0],
  }, // North-Below (fixed tangent):contentReference[oaicite:4]{index=4}

  // West face (top/bottom)
  {
    letter: 'Samekh',
    pos: [westX, topY, 0],
    normal: [-1, +1, 0],
    tangent: [0, 0, +1],
  }, // West-Above
  {
    letter: 'Ayin',
    pos: [westX, botY, 0],
    normal: [-1, -1, 0],
    tangent: [0, 0, +1],
  }, // West-Below (fixed tangent):contentReference[oaicite:5]{index=5}

  // South face (top/bottom)
  {
    letter: 'Tzaddi',
    pos: [0, topY, southZ],
    normal: [0, +1, +1],
    tangent: [+1, 0, 0],
  }, // South-Above
  {
    letter: 'Qoph',
    pos: [0, botY, southZ],
    normal: [0, -1, +1],
    tangent: [+1, 0, 0],
  }, // South-Below (fixed tangent):contentReference[oaicite:6]{index=6},
];

export const axes: Axis[] = [
  {
    letter: 'Aleph',
    from: [0, -HALF, 0],
    to: [0, +HALF, 0],
    pos: [0, MOTHER_OFFSET, 0],
    tangent: [0, 1, 0],
    normal: [0, 0, 1],
  },
  {
    letter: 'Mem',
    from: [-HALF, 0, 0],
    to: [+HALF, 0, 0],
    pos: [MOTHER_OFFSET, 0, 0],
    tangent: [1, 0, 0],
    normal: [0, 1, 0],
  },
  {
    letter: 'Shin',
    from: [0, 0, -HALF],
    to: [0, 0, +HALF],
    pos: [0, 0, MOTHER_OFFSET],
    tangent: [0, 0, 1],
    normal: [0, 1, 0],
  },
];
