"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Float, PerspectiveCamera, Sparkles } from "@react-three/drei";
import * as THREE from "three";

function FloatingShapes() {
  const groupRef = useRef<THREE.Group>(null);

  // Animate the entire group slowly
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.05) * 0.1;
    }
  });

  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#6366f1",
        transmission: 0.9,
        opacity: 1,
        metalness: 0.2,
        roughness: 0.1,
        ior: 1.5,
        thickness: 2,
        specularIntensity: 1,
        specularColor: new THREE.Color("#a855f7"),
        envMapIntensity: 1,
      }),
    []
  );

  const material2 = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#06b6d4",
        transmission: 0.9,
        opacity: 1,
        metalness: 0.2,
        roughness: 0.1,
        ior: 1.5,
        thickness: 2,
        specularIntensity: 1,
        specularColor: new THREE.Color("#6366f1"),
        envMapIntensity: 1,
      }),
    []
  );

  return (
    <group ref={groupRef}>
      {/* Central Abstract Shape */}
      <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
        <mesh position={[0, 0, 0]} material={material}>
          <icosahedronGeometry args={[2, 0]} />
        </mesh>
      </Float>

      {/* Orbiting Shapes */}
      <Float speed={2} rotationIntensity={2} floatIntensity={3}>
        <mesh position={[4, 2, -3]} material={material2}>
          <torusGeometry args={[1, 0.3, 16, 100]} />
        </mesh>
      </Float>

      <Float speed={1.5} rotationIntensity={1.5} floatIntensity={2.5}>
        <mesh position={[-4, -2, -4]} material={material2}>
          <octahedronGeometry args={[1.5, 0]} />
        </mesh>
      </Float>
      
      <Float speed={2.5} rotationIntensity={3} floatIntensity={1.5}>
        <mesh position={[2, -3, 2]} material={material}>
          <dodecahedronGeometry args={[1, 0]} />
        </mesh>
      </Float>
      
      <Float speed={1.2} rotationIntensity={1} floatIntensity={4}>
        <mesh position={[-3, 3, 2]} material={material}>
          <sphereGeometry args={[0.8, 32, 32]} />
        </mesh>
      </Float>
    </group>
  );
}

export default function Background3D() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -10,
        pointerEvents: "none",
        background: "radial-gradient(circle at 50% 50%, rgba(5, 6, 15, 1) 0%, #030408 100%)",
      }}
    >
      <Canvas dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={45} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#6366f1" />
        <pointLight position={[-10, -10, -5]} intensity={1} color="#a855f7" />
        <pointLight position={[0, 10, -10]} intensity={0.5} color="#06b6d4" />
        
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        <Sparkles count={200} scale={15} size={2} speed={0.4} opacity={0.3} color="#a855f7" />
        
        <FloatingShapes />
      </Canvas>
    </div>
  );
}
