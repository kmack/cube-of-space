// src/utils/orientation.ts
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { UP } from "../data/constants";

export function eulerFromNormalAndTangent(
  normal: [number, number, number],
  tangent: [number, number, number]
): [number, number, number] {
  const n = new THREE.Vector3(...normal).normalize(); // z
  const t = new THREE.Vector3(...tangent).normalize(); // x
  const b = new THREE.Vector3().crossVectors(n, t).normalize(); // y
  const m = new THREE.Matrix4().makeBasis(t, b, n);
  const e = new THREE.Euler().setFromRotationMatrix(m, "XYZ");
  return [e.x, e.y, e.z];
}

// Lightweight state reused per-frame
const tmp = {
  t: new THREE.Vector3(),
  n: new THREE.Vector3(),
  b: new THREE.Vector3(),
  view: new THREE.Vector3(),
  pref: new THREE.Vector3(),
  worldPos: new THREE.Vector3(),
  m: new THREE.Matrix4(),
};

/**
 * Axis-facing tag: orient a label that sits on an interior axis.
 * Mirrors your existing logic: avoid mirrored half-plane; discrete flip when crossing
 * the perpendicular axis; enforce upright parity for horizontal mothers.
 */
export function useAxisFacingQuaternion(
  ref: React.RefObject<THREE.Group>,
  pos: [number, number, number],
  axisTangent: [number, number, number],
  flipRefTangent?: [number, number, number],
  fallbackNormal: [number, number, number] = [0, 0, 1]
): void {
  const [ax, ay, az] = axisTangent;
  const [fx, fy, fz] = fallbackNormal;
  const tNorm = new THREE.Vector3(ax, ay, az).normalize();
  const fallback = new THREE.Vector3(fx, fy, fz).normalize();
  const flipRef = flipRefTangent
    ? new THREE.Vector3(...flipRefTangent).normalize()
    : null;

  useFrame(({ camera }) => {
    const { t, view, n, b, pref, m, worldPos } = tmp;
    t.copy(tNorm);

    if (ref.current) ref.current.getWorldPosition(worldPos);
    else worldPos.set(pos[0], pos[1], pos[2]);

    view.copy(camera.position).sub(worldPos);

    // n = view projected onto plane ⟂ t
    const vdot = view.dot(t);
    n.copy(view).addScaledVector(t, -vdot);
    if (n.lengthSq() < 1e-6) {
      n.copy(fallback).addScaledVector(t, -fallback.dot(t)).normalize();
    } else {
      n.normalize();
    }
    b.crossVectors(n, t).normalize();

    // (1) Canonical baseline: avoid mirrored default half-plane
    if (flipRef) {
      const rightCanon = pref.copy(UP).cross(flipRef).normalize(); // R = UP × flipRef
      if (rightCanon.lengthSq() > 1e-6 && t.dot(rightCanon) < 0) {
        t.multiplyScalar(-1);
        b.multiplyScalar(-1);
      }
    }

    // (2) Perpendicular-axis crossing: discrete flip around n
    if (flipRef) {
      pref.copy(flipRef).addScaledVector(t, -flipRef.dot(t));
      if (pref.lengthSq() > 1e-6) {
        pref.normalize();
        if (n.dot(pref) < -1e-4) {
          t.multiplyScalar(-1);
          b.multiplyScalar(-1);
        }
      }
    }

    // (3) Upright parity for horizontal axes (Mem/Shin)
    if (Math.abs(t.dot(UP)) < 0.95 && b.dot(UP) < -1e-4) {
      b.multiplyScalar(-1);
      n.multiplyScalar(-1);
    }

    m.makeBasis(t, b, n);
    ref.current?.quaternion.setFromRotationMatrix(m);
  });
}
