// src/components/debug-rich-label.tsx
import * as React from 'react';
import * as THREE from 'three';

// Simple debug version to test basic canvas texture rendering
export function DebugRichLabel(): React.JSX.Element {
  const [texture, setTexture] = React.useState<THREE.Texture | null>(null);

  React.useEffect(() => {
    // Create a simple test canvas texture
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = 256;
    canvas.height = 128;

    // Clear with bright background for debugging
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add white text
    ctx.fillStyle = 'white';
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('DEBUG', canvas.width / 2, canvas.height / 2);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    setTexture(tex);

    return () => {
      tex.dispose();
    };
  }, []);

  if (!texture) return <group />;

  return (
    <mesh position={[2, 2, 2]} scale={[1, 0.5, 1]} rotation={[Math.PI, 0, 0]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        // eslint-disable-next-line react/no-unknown-property
        map={texture}
        transparent
        side={THREE.BackSide}
      />
    </mesh>
  );
}