import React, { useEffect, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const GamingSetup = ({ isMobile, setHudOpen }) => {
  const { scene } = useGLTF("./models/gaming_setup/scene.gltf");

  const screenRef = useRef();
  const { camera, raycaster } = useThree();
  const mouse = useRef(new THREE.Vector2());

  // Récupérer le mesh
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh && child.name === "Cube011_screen001_0") {
        screenRef.current = child;
      }
    });
  }, [scene]);

  // Capture la souris
  useEffect(() => {
    const onMouseMove = (event) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  // Raycasting pour ouvrir le HUD
  useFrame(() => {
    if (!screenRef.current) return;

    raycaster.setFromCamera(mouse.current, camera);
    const intersects = raycaster.intersectObject(screenRef.current);

    if (intersects.length > 0) {
      setHudOpen(true);
    }
  });

  return (
    <group>
      <hemisphereLight intensity={0.15} groundColor="#330000" />
      <spotLight
        angle={0.4}
        castShadow
        color="#339cff"
        intensity={2}
        penumbra={0.5}
        position={[10, 15, 10]}
      />
      <pointLight position={[-10, 5, -5]} intensity={0.8} color="#ff0000" />
      <pointLight position={[0, 5, 0]} intensity={0.3} color="#ffffff" />
      <primitive
        object={scene}
        scale={isMobile ? 0.7 : 0.75}
        position={isMobile ? [0, -3, -2.2] : [0, -3.25, -1.5]}
        rotation={[-0.01, -0.2, -0.1]}
        castShadow
        receiveShadow
      />
    </group>
  );
};

export default GamingSetup;
