import * as React from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html, Line } from "@react-three/drei";

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

function MotherLabels() {
  return (
    <>
      {axes.map((a, i) => {
        // tangent along the axis
        const t = new THREE.Vector3(
          a.to[0] - a.from[0],
          a.to[1] - a.from[1],
          a.to[2] - a.from[2]
        ).normalize();

        // positions: one label near each end, pulled inward by MOTHER_OFFSET
        const fromPos = new THREE.Vector3(...a.from).add(
          t.clone().multiplyScalar(MOTHER_OFFSET)
        ) as unknown as Vec3;
        const toPos = new THREE.Vector3(...a.to).add(
          t.clone().multiplyScalar(-MOTHER_OFFSET)
        ) as unknown as Vec3;

        // orient both labels using the same basis (normal = a.normal, tangent = t)
        const rot = eulerFromNormalAndTangent(a.normal, [t.x, t.y, t.z]);

        const Tag = ({ pos }: { pos: Vec3 }) => (
          <group position={pos} rotation={rot}>
            <Html center transform distanceFactor={1.5}>
              <div style={tagStyleStrong}>
                <div style={{ fontSize: 14, opacity: 0.8 }}>{a.label}</div>
                <div style={{ fontSize: 18 }}>
                  {a.letter} · Key {a.key}
                </div>
              </div>
            </Html>
          </group>
        );

        return (
          <React.Fragment key={i}>
            <Tag pos={fromPos} />
            <Tag pos={toPos} />
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
          <Html center transform distanceFactor={1.5}>
            <div style={tagStyle}>
              <div style={{ fontSize: 14, opacity: 0.7 }}>{f.name}</div>
              <div style={{ fontSize: 18 }}>
                {f.letter} · Key {f.key}
              </div>
            </div>
          </Html>
        </group>
      ))}

      {/* Center stays billboarded */}
      <group position={center.pos}>
        <Html center transform distanceFactor={1.5}>
          <div style={tagStyleStrong}>
            <div style={{ fontSize: 14, opacity: 0.8 }}>{center.name}</div>
            <div style={{ fontSize: 18 }}>
              {center.letter} · Key {center.key}
            </div>
          </div>
        </Html>
      </group>
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
            <Html center transform distanceFactor={1.5}>
              <div style={edgeStyle}>
                <div style={{ fontSize: 14 }}>{e.label}</div>
                <div style={{ fontSize: 16 }}>{e.letter}</div>
              </div>
            </Html>
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
        const rot = eulerFromNormalAndTangent(a.normal, a.tangent);
        return (
          <group key={i}>
            <Line points={[a.from, a.to]} color={color} lineWidth={lineWidth} />
            <group position={a.pos} rotation={rot}>
              <Html center transform distanceFactor={1.4}>
                <div style={axisStyle}>{a.label}</div>
              </Html>
            </group>
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

const noInteract: React.CSSProperties = {
  pointerEvents: "none", // let OrbitControls receive all pointer events
  userSelect: "none",
  WebkitUserSelect: "none",
  MozUserSelect: "none",
  msUserSelect: "none",
};

const tagStyle: React.CSSProperties = {
  background: "rgba(0,0,0,0.55)",
  color: "white",
  padding: "6px 10px",
  borderRadius: 8,
  backdropFilter: "blur(4px)",
  whiteSpace: "nowrap",
  ...noInteract,
};
const tagStyleStrong: React.CSSProperties = {
  ...tagStyle,
  background: "rgba(0,0,0,0.7)",
  border: "1px solid rgba(255,255,255,0.15)",
};
const edgeStyle: React.CSSProperties = {
  ...tagStyle,
  fontSize: 12,
  padding: "4px 8px",
};
const axisStyle: React.CSSProperties = {
  ...tagStyle,
  fontSize: 12,
  padding: "2px 6px",
};

export default function CubeOfSpace() {
  return (
    <Canvas
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
