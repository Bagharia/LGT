import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Particles = ({ count = 3500 }) => {
  const mesh = useRef();
  const mousePos = useRef({ x: 0, y: 0 });

  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 25;

      // Étoiles style espace : blanches, bleutées, cyan
      const t = Math.random();
      if (t < 0.5) {
        // Étoiles blanches/bleutées
        colors[i * 3] = 0.85 + Math.random() * 0.15;
        colors[i * 3 + 1] = 0.9 + Math.random() * 0.1;
        colors[i * 3 + 2] = 1;
      } else if (t < 0.8) {
        // Étoiles bleu cyan (#00D2FF)
        colors[i * 3] = 0;
        colors[i * 3 + 1] = 0.82;
        colors[i * 3 + 2] = 1;
      } else {
        // Étoiles bleu profond (#0077FF)
        colors[i * 3] = 0;
        colors[i * 3 + 1] = 0.47;
        colors[i * 3 + 2] = 1;
      }
    }

    return [positions, colors];
  }, [count]);

  useFrame(() => {
    if (mesh.current) {
      mesh.current.rotation.y += 0.0003;
      mesh.current.rotation.x = mousePos.current.y * 0.05;
      mesh.current.rotation.y += mousePos.current.x * 0.0003;
    }
  });

  // Track mouse position
  if (typeof window !== 'undefined') {
    window.addEventListener('mousemove', (e) => {
      mousePos.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mousePos.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });
  }

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        vertexColors
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const Torus = ({ position, color, size = 3, tubeSize = 0.5, rotationSpeed = { x: 0.005, y: 0.002 } }) => {
  const mesh = useRef();

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x += rotationSpeed.x;
      mesh.current.rotation.y += rotationSpeed.y;
      mesh.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.5;
    }
  });

  return (
    <mesh ref={mesh} position={position}>
      <torusGeometry args={[size, tubeSize, 16, 100]} />
      <meshBasicMaterial color={color} wireframe transparent opacity={0.15} />
    </mesh>
  );
};

const HeroCanvas = () => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
        <Particles count={3500} />
        <Torus
          position={[5, 0, -5]}
          color="#00D2FF"
          size={3}
          tubeSize={0.4}
          rotationSpeed={{ x: 0.003, y: 0.001 }}
        />
        <Torus
          position={[-4, 2, -3]}
          color="#0077FF"
          size={2}
          tubeSize={0.25}
          rotationSpeed={{ x: 0.002, y: 0.004 }}
        />
        <Torus
          position={[2, -3, -6]}
          color="#00FFD2"
          size={1.5}
          tubeSize={0.2}
          rotationSpeed={{ x: 0.004, y: 0.003 }}
        />
      </Canvas>
    </div>
  );
};

export default HeroCanvas;
