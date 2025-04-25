// src/components/canvas/GamingSetup.jsx
import React, { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const GamingSetup = ({ isMobile, setHud1Open, setHud2Open, setHud3Open }) => {
  const { scene } = useGLTF("./models/gaming_setup/scene.gltf");
  const screenRef1 = useRef();
  const screenRef2 = useRef();
  const screenRef3 = useRef();
  const { camera, gl, raycaster } = useThree();
  const mouse = useRef(new THREE.Vector2());
  const hovered = useRef(false);

  // Trouver les meshes
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh && child.name === "Cube011_screen001_0") {
        screenRef1.current = child;
      }
      if (child.isMesh && child.name === "Object_6_Screen001_0") {
        screenRef2.current = child;
      }
      if (
        child.isMesh &&
        child.name === "Cube003_Material001_0_Material074_30001_0"
      ) {
        screenRef3.current = child;
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

  // Raycasting pour ouvrir les HUDs
  useFrame(() => {
    raycaster.setFromCamera(mouse.current, camera);

    const intersectsAny = [screenRef1, screenRef2, screenRef3].some(
      (ref) => ref.current && raycaster.intersectObject(ref.current).length > 0
    );

    // hover
    if (intersectsAny && !hovered.current) {
      gl.domElement.style.cursor = "crosshair";
      hovered.current = true;
    }
    if (!intersectsAny && hovered.current) {
      gl.domElement.style.cursor = "auto";
      hovered.current = false;
    }

    // HUD 1
    if (
      screenRef1.current &&
      raycaster.intersectObject(screenRef1.current).length > 0
    ) {
      setHud1Open();
    }
    // HUD 2
    if (
      screenRef2.current &&
      raycaster.intersectObject(screenRef2.current).length > 0
    ) {
      setHud2Open();
    }
    // HUD 3
    if (
      screenRef3.current &&
      raycaster.intersectObject(screenRef3.current).length > 0
    ) {
      setHud3Open();
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
