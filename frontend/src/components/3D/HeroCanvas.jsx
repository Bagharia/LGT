import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Particles = ({ count = 3000 }) => {
  const mesh = useRef();
  const mousePos = useRef({ x: 0, y: 0 });

  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

      // Gradient de couleurs (vert lime -> cyan)
      const t = Math.random();
      colors[i * 3] = 0.78 * (1 - t) + 0 * t;     // R
      colors[i * 3 + 1] = 1 * (1 - t) + 1 * t;    // G
      colors[i * 3 + 2] = 0 * (1 - t) + 0.78 * t; // B
    }

    return [positions, colors];
  }, [count]);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y += 0.0005;
      mesh.current.rotation.x = mousePos.current.y * 0.1;
      mesh.current.rotation.y += mousePos.current.x * 0.0005;
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
        size={0.02}
        vertexColors
        transparent
        opacity={0.8}
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
      <meshBasicMaterial color={color} wireframe transparent opacity={0.3} />
    </mesh>
  );
};

const HeroCanvas = () => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
        <Particles count={3000} />
        <Torus
          position={[5, 0, -5]}
          color="#c8ff00"
          size={3}
          tubeSize={0.5}
          rotationSpeed={{ x: 0.005, y: 0.002 }}
        />
        <Torus
          position={[-4, 2, -3]}
          color="#00ffc8"
          size={2}
          tubeSize={0.3}
          rotationSpeed={{ x: 0.003, y: 0.005 }}
        />
      </Canvas>
    </div>
  );
};

export default HeroCanvas;
