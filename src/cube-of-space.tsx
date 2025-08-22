import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line, Text, Billboard } from "@react-three/drei";

// ---- Types ----
type Vec3 = [number, number, number];

function eulerFromNormalAndTangent(
  normal: Vec3,
  tangent: Vec3
): [number, number, number] {
  const n = new THREE.Vector3(...normal).normalize(); // z-axis of the label plane
  const t = new THREE.Vector3(...tangent).normalize(); // x-axis (text baseline) of the label plane
  const b = new THREE.Vector3().crossVectors(n, t).normalize(); // y-axis, completes the frame

  // Build a basis where columns are [t, b, n]
  const m = new THREE.Matrix4().makeBasis(t, b, n);
  const e = new THREE.Euler().setFromRotationMatrix(m, "XYZ");
  return [e.x, e.y, e.z];
}

type Face = {
  name: string;
  letter: string;
  key: string;
  pos: Vec3;
  rotation: [number, number, number];
};

type Edge = {
  label: string;
  letter: string;
  pos: Vec3;
  normal: Vec3; // which way the label should face
  tangent: Vec3; // along-edge direction for the text baseline
};

type Axis = {
  label: string;
  letter: string;
  key: string;
  from: Vec3; // axis start
  to: Vec3; // axis end
  pos: Vec3; // where the label sits
  normal: Vec3; // preferred “up/out” direction for label plane
  tangent: Vec3; // along-axis direction for the text baseline
};

// ---- Config ----
const SIZE = 2; // cube side length in world units
const HALF = SIZE / 2;
const MOTHER_OFFSET = SIZE * 0.18; // tweak 0.12–0.25 to taste
const UP = new THREE.Vector3(0, 1, 0);

// Faces (double letters / planets)
const faces: Face[] = [
  {
    name: "Beth · Mercury · Key 1",
    letter: "ב",
    key: "1",
    pos: [0, +HALF, 0],
    rotation: [-Math.PI / 2, 0, 0],
  },
  {
    name: "Gimel · Moon · Key 2",
    letter: "ג",
    key: "2",
    pos: [0, -HALF, 0],
    rotation: [Math.PI / 2, 0, 0],
  },
  {
    name: "Daleth · Venus · Key 3",
    letter: "ד",
    key: "3",
    pos: [+HALF, 0, 0],
    rotation: [0, Math.PI / 2, 0],
  },
  {
    name: "Kaph · Jupiter · Key 10",
    letter: "כ",
    key: "10",
    pos: [-HALF, 0, 0],
    rotation: [0, -Math.PI / 2, 0],
  },
  {
    name: "Resh · Sun · Key 19",
    letter: "ר",
    key: "19",
    pos: [0, 0, +HALF],
    rotation: [0, 0, 0],
  },
  {
    name: "Peh · Mars · Key 16",
    letter: "פ",
    key: "16",
    pos: [0, 0, -HALF],
    rotation: [0, Math.PI, 0],
  },
];

// Center
const center: Face = {
  name: "Tav · Saturn · Key 21",
  letter: "ת",
  key: "21",
  pos: [0, 0, 0],
  rotation: [0, 0, 0],
};

// Edges (simple letters / zodiac)
// Helpers for edge midpoints:
const topY = +HALF,
  botY = -HALF;
const eastX = +HALF,
  westX = -HALF;
const southZ = +HALF,
  northZ = -HALF;

const edges: Edge[] = [
  // verticals at corners
  {
    label: "Heh · Aries",
    letter: "ה",
    pos: [eastX, 0, northZ],
    normal: [+1, 0, -1],
    tangent: [0, 1, 0],
  }, // NE vertical
  {
    label: "Vav · Taurus",
    letter: "ו",
    pos: [eastX, 0, southZ],
    normal: [+1, 0, +1],
    tangent: [0, 1, 0],
  }, // SE vertical
  {
    label: "Lamed · Libra",
    letter: "ל",
    pos: [westX, 0, northZ],
    normal: [-1, 0, -1],
    tangent: [0, 1, 0],
  }, // NW vertical
  {
    label: "Nun · Scorpio",
    letter: "נ",
    pos: [westX, 0, southZ],
    normal: [-1, 0, +1],
    tangent: [0, 1, 0],
  }, // SW vertical

  // east face top/bottom edges
  {
    label: "Zain · Gemini",
    letter: "ז",
    pos: [eastX, topY, 0],
    normal: [+1, 1, 0],
    tangent: [0, 0, -1],
  }, // East-Above
  {
    label: "Cheth · Cancer",
    letter: "ח",
    pos: [eastX, botY, 0],
    normal: [+1, -1, 0],
    tangent: [0, 0, -1],
  }, // East-Below

  // north face top/bottom edges
  {
    label: "Teth · Leo",
    letter: "ט",
    pos: [0, topY, northZ],
    normal: [0, 1, -1],
    tangent: [-1, 0, 0],
  }, // North-Above
  {
    label: "Yod · Virgo",
    letter: "י",
    pos: [0, botY, northZ],
    normal: [0, -1, -1],
    tangent: [-1, 0, 0],
  }, // North-Below

  // west face top/bottom edges
  {
    label: "Samekh · Sag.",
    letter: "ס",
    pos: [westX, topY, 0],
    normal: [-1, 1, 0],
    tangent: [0, 0, 1],
  }, // West-Above
  {
    label: "Ayin · Capricorn",
    letter: "ע",
    pos: [westX, botY, 0],
    normal: [-1, -1, 0],
    tangent: [0, 0, 1],
  }, // West-Below

  // south face top/bottom edges
  {
    label: "Tzaddi · Aquarius",
    letter: "צ",
    pos: [0, topY, southZ],
    normal: [0, 1, +1],
    tangent: [1, 0, 0],
  }, // South-Above
  {
    label: "Qoph · Pisces",
    letter: "ק",
    pos: [0, botY, southZ],
    normal: [0, -1, +1],
    tangent: [1, 0, 0],
  }, // South-Below
];

// Mother letters (internal axes)
const axes: Axis[] = [
  // Aleph: Above <-> Below (Y axis)
  {
    label: "Aleph · Air",
    letter: "א",
    key: "0",
    from: [0, -HALF, 0],
    to: [0, +HALF, 0],
    pos: [0, MOTHER_OFFSET, 0], // where the label sits
    tangent: [0, 1, 0], // along the axis
    normal: [0, 0, 1], // label’s “outward” direction
  },
  // Mem: East <-> West (X axis)
  {
    label: "Mem · Water",
    letter: "מ",
    key: "12",
    from: [-HALF, 0, 0],
    to: [+HALF, 0, 0],
    pos: [MOTHER_OFFSET, 0, 0],
    tangent: [1, 0, 0],
    normal: [0, 1, 0],
  },
  // Shin: South <-> North (Z axis)
  {
    label: "Shin · Fire",
    letter: "ש",
    key: "20",
    from: [0, 0, -HALF],
    to: [0, 0, +HALF],
    pos: [0, 0, MOTHER_OFFSET], // <- not at the cube center anymore
    tangent: [0, 0, 1],
    normal: [0, 1, 0],
  },
];

function Label3D({
  title,
  subtitle,
  size = 0.08,
  gap = 0.08,
  color = "white",
}: {
  title: string;
  subtitle?: string;
  size?: number;
  gap?: number;
  color?: string;
}) {
  return (
    <group>
      <Text
        anchorX="center"
        anchorY="middle"
        fontSize={size}
        lineHeight={1.1}
        color={color}
        material-toneMapped={false}
        material-depthTest={true} // (optional; true by default)
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          anchorX="center"
          anchorY="middle"
          fontSize={size * 0.85}
          position={[0, -gap, 0]}
          color={color}
          material-toneMapped={false}
          material-transparent={true} // needed for opacity < 1
          material-opacity={0.9}
          material-depthTest={true} // (optional)
        >
          {subtitle}
        </Text>
      )}
    </group>
  );
}

function AxisFacingTag({
  pos,
  axisTangent, // [x,y,z]
  flipRefTangent, // [x,y,z] for the OTHER horizontal axis (optional)
  fallbackNormal, // [x,y,z] used only when camera lies exactly on axis
  title,
  subtitle,
  size = 0.08,
  gap = 0.08,
  color = "white",
}: {
  pos: Vec3;
  axisTangent: Vec3;
  flipRefTangent?: Vec3;
  fallbackNormal: Vec3;
  title: string;
  subtitle?: string;
  size?: number;
  gap?: number;
  color?: string;
}) {
  const ref = React.useRef<THREE.Group>(null!);

  const tmp = React.useMemo(
    () => ({
      t: new THREE.Vector3(),
      view: new THREE.Vector3(),
      n: new THREE.Vector3(),
      b: new THREE.Vector3(),
      pref: new THREE.Vector3(), // projected reference normal (⊥ axis)
      camX: new THREE.Vector3(), // camera right (world)
      rightProj: new THREE.Vector3(), // camera right projected into plane ⟂ t
      m: new THREE.Matrix4(),
      worldPos: new THREE.Vector3(),
    }),
    []
  );

  // Destructure arrays to simple deps (lint clean)
  const [ax, ay, az] = axisTangent;
  const [fx, fy, fz] = fallbackNormal;
  const [rx, ry, rz] = flipRefTangent ?? [0, 0, 0];

  const tNorm = React.useMemo(
    () => new THREE.Vector3(ax, ay, az).normalize(),
    [ax, ay, az]
  );
  const fallback = React.useMemo(
    () => new THREE.Vector3(fx, fy, fz).normalize(),
    [fx, fy, fz]
  );
  const flipRef = React.useMemo(
    () => (flipRefTangent ? new THREE.Vector3(rx, ry, rz).normalize() : null),
    [flipRefTangent, rx, ry, rz]
  );

  useFrame(({ camera }) => {
    const { t, view, n, b, pref, m, worldPos } = tmp;

    // --- basis from camera & axis ---
    t.copy(tNorm);
    if (ref.current) ref.current.getWorldPosition(worldPos);
    else worldPos.set(pos[0], pos[1], pos[2]);
    view.copy(camera.position).sub(worldPos);

    // n = view projected into plane ⟂ t
    const vdot = view.dot(t);
    n.copy(view).addScaledVector(t, -vdot);
    if (n.lengthSq() < 1e-6) {
      n.copy(fallback).addScaledVector(t, -fallback.dot(t)).normalize();
    } else {
      n.normalize();
    }
    b.crossVectors(n, t).normalize();

    // --- 1) Canonical baseline (constant) : avoid mirrored default half-plane ---
    if (flipRef) {
      const rightCanon = pref.copy(UP).cross(flipRef).normalize(); // R = UP × flipRef
      if (rightCanon.lengthSq() > 1e-6 && t.dot(rightCanon) < 0) {
        t.multiplyScalar(-1); // 180° around n
        b.multiplyScalar(-1);
      }
    }

    // --- 2) Perpendicular-axis crossing (discrete) : flip baseline when crossing the other axis ---
    if (flipRef) {
      // project flipRef into this plane
      pref.copy(flipRef).addScaledVector(t, -flipRef.dot(t));
      if (pref.lengthSq() > 1e-6) {
        pref.normalize();
        if (n.dot(pref) < -1e-4) {
          // small hysteresis
          t.multiplyScalar(-1); // 180° around n
          b.multiplyScalar(-1);
        }
      }
    }

    // --- 3) Upright parity (discrete) : ensure vertical reads upright (after baseline flips) ---
    if (Math.abs(t.dot(UP)) < 0.95) {
      // horizontal mothers only (Mem/Shin)
      if (b.dot(UP) < -1e-4) {
        // if label up points down, roll around t
        b.multiplyScalar(-1); // 180° around t
        n.multiplyScalar(-1);
      }
    }

    // finalize
    m.makeBasis(t, b, n);
    ref.current?.quaternion.setFromRotationMatrix(m);
  });

  return (
    <group ref={ref} position={pos}>
      <Label3D
        title={title}
        subtitle={subtitle}
        size={size}
        gap={gap}
        color={color}
      />
    </group>
  );
}

function MotherLabels() {
  // Build per-axis tangents and mark horizontals
  const info = axes.map((a, idx) => {
    const t = new THREE.Vector3(
      a.to[0] - a.from[0],
      a.to[1] - a.from[1],
      a.to[2] - a.from[2]
    ).normalize();
    const horizontal = Math.abs(t.dot(UP)) < 0.95;
    return { idx, a, t, horizontal };
  });

  // Extract the two horizontal mother axes (Mem, Shin) by geometry
  const horizontals = info.filter((i) => i.horizontal);
  const h0 = horizontals[0];
  const h1 = horizontals[1];

  return (
    <>
      {info.map(({ idx, a, t, horizontal }) => {
        // Inset positions
        const fromPos = new THREE.Vector3(...a.from).add(
          t.clone().multiplyScalar(MOTHER_OFFSET)
        ) as unknown as Vec3;
        const toPos = new THREE.Vector3(...a.to).add(
          t.clone().multiplyScalar(-MOTHER_OFFSET)
        ) as unknown as Vec3;

        // For each horizontal axis, use the OTHER horizontal axis as the flip reference
        const flipRefTangent: Vec3 | undefined =
          horizontal && h0 && h1
            ? idx === h0.idx
              ? ([h1.t.x, h1.t.y, h1.t.z] as Vec3)
              : idx === h1.idx
              ? ([h0.t.x, h0.t.y, h0.t.z] as Vec3)
              : undefined
            : undefined;

        return (
          <React.Fragment key={idx}>
            <AxisFacingTag
              pos={fromPos}
              axisTangent={[t.x, t.y, t.z]}
              flipRefTangent={flipRefTangent}
              fallbackNormal={a.normal}
              title={`${a.letter} · Key ${a.key}`}
              subtitle={a.label}
            />
            <AxisFacingTag
              pos={toPos}
              axisTangent={[t.x, t.y, t.z]}
              flipRefTangent={flipRefTangent}
              fallbackNormal={a.normal}
              title={`${a.letter} · Key ${a.key}`}
              subtitle={a.label}
            />
          </React.Fragment>
        );
      })}
    </>
  );
}

// ---- Components ----

function FaceLabels() {
  return (
    <>
      {faces.map((f, i) => (
        <group key={i} position={f.pos} rotation={f.rotation}>
          <Label3D title={`${f.letter} · Key ${f.key}`} subtitle={f.name} />
        </group>
      ))}

      {/* Center stays billboarded */}
      <Billboard position={center.pos}>
        <Label3D
          title={`${center.letter} · Key ${center.key}`}
          subtitle={center.name}
        />
      </Billboard>
    </>
  );
}

function FacePlanes({ opacity = 0.28 }: { opacity?: number }) {
  // Map each face (by Key/letter) to its color
  // Keys from your faces[]:
  //   Key 1 (Beth)   -> Above  -> Yellow
  //   Key 2 (Gimel)  -> Below  -> Blue
  //   Key 3 (Daleth) -> East   -> Green
  //   Key 10 (Kaph)  -> West   -> Purple
  //   Key 19 (Resh)  -> South  -> Orange
  //   Key 16 (Peh)   -> North  -> Red
  const colorByKey: Record<string, string> = {
    "1": "#ffd500", // warm yellow
    "2": "#3b7cff", // vivid blue
    "3": "#2ec27e", // green
    "10": "#8a63ff", // purple
    "16": "#ff4d4f", // red
    "19": "#ff9a1f", // orange
  };

  // Slightly shrink planes so edges remain visible,
  // and use polygon offset to avoid z-fighting with WireCube lines.
  const planeSize = SIZE - 0.01;

  return (
    <>
      {faces.map((f, i) => (
        <group key={`plane-${i}`} position={f.pos} rotation={f.rotation}>
          <mesh renderOrder={-1}>
            <planeGeometry args={[planeSize, planeSize]} />
            <meshStandardMaterial
              color={colorByKey[f.key] ?? "#ffffff"}
              transparent
              opacity={opacity}
              depthWrite={false}
              polygonOffset
              polygonOffsetFactor={1}
              polygonOffsetUnits={1}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </>
  );
}

function EdgeLabels() {
  return (
    <>
      {edges.map((e, i) => {
        const rot = eulerFromNormalAndTangent(e.normal, e.tangent);
        return (
          <group key={i} position={e.pos} rotation={rot}>
            <Label3D title={e.letter} subtitle={e.label} />
          </group>
        );
      })}
    </>
  );
}

function AxesLines() {
  const color = "#888";
  const lineWidth = 2;

  return (
    <>
      {axes.map((a, i) => {
        return (
          <group key={i}>
            <Line points={[a.from, a.to]} color={color} lineWidth={lineWidth} />
          </group>
        );
      })}
    </>
  );
}

function WireCube({
  size = SIZE,
  color = "#444",
}: {
  size?: number;
  color?: string;
}) {
  const h = size / 2;
  const corners: Vec3[] = [
    [-h, -h, -h],
    [h, -h, -h],
    [h, -h, h],
    [-h, -h, h], // bottom square
    [-h, h, -h],
    [h, h, -h],
    [h, h, h],
    [-h, h, h], // top square
  ];
  const edgesIndex: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0], // bottom
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4], // top
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7], // uprights
  ];
  return (
    <>
      {edgesIndex.map((pair, i) => (
        <Line
          key={i}
          points={[corners[pair[0]], corners[pair[1]]]}
          color={color}
          lineWidth={1.5}
        />
      ))}
    </>
  );
}

export default function CubeOfSpace() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [4, 3, 6], fov: 50 }}
      onCreated={({ gl }) => {
        gl.domElement.style.userSelect = "none";
      }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={0.9} />
      {/* Controls */}
      <OrbitControls enableDamping dampingFactor={0.15} rotateSpeed={0.9} />
      {/* Ground grid for orientation */}
      <gridHelper
        args={[10, 10, "#666", "#333"]}
        position={[0, -HALF - 0.001, 0]}
      />
      {/* Cube face fills */}
      <FacePlanes opacity={0.8} />
      {/* Cube */}
      <WireCube />
      {/* Annotations */}
      <FaceLabels />
      <EdgeLabels />
      <AxesLines />
      <MotherLabels />
    </Canvas>
  );
}
