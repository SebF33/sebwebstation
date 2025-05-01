// src/components/canvas/GamingSetup.jsx
import React, { useEffect, useRef, useState } from "react";
import { useCursor, useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const GamingSetup = ({ isMobile, setHud1Open, setHud2Open, setHud3Open }) => {
  const { scene } = useGLTF("./models/gaming_setup/scene.gltf");
  const screenRef1 = useRef();
  const screenRef2 = useRef();
  const screenRef3 = useRef();
  const { camera, gl, raycaster } = useThree();
  const mouse = useRef(new THREE.Vector2());
  const [hoveredMesh, setHoveredMesh] = useState(null);

  // Changer le curseur au hover des meshes
  useCursor(!!hoveredMesh, "crosshair", "auto");

  // Trouver les meshes
  useEffect(() => {
    scene.traverse((child) => {
      if (!child.isMesh) return;
      switch (child.name) {
        case "Cube011_screen001_0":
          screenRef1.current = child;
          break;
        case "Object_6_Screen001_0":
          screenRef2.current = child;
          break;
        case "Cube003_Material001_0_Material074_30001_0":
          screenRef3.current = child;
          break;
        default:
          break;
      }
      // ombres
      child.castShadow = true;
      child.receiveShadow = true;
      // intensité emissive de base
      if (child.material) {
        child.material.emissiveIntensity = 0.4;
      }
    });
  }, [scene]);

  // Capture la souris (pour desktop et mobile)
  useEffect(() => {
    const updateMouse = (clientX, clientY) => {
      const rect = gl.domElement.getBoundingClientRect();
      mouse.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onMouseMove = (event) => {
      updateMouse(event.clientX, event.clientY);
    };

    const onTouchMove = (event) => {
      event.preventDefault();
      const touch = event.touches[0];
      updateMouse(touch.clientX, touch.clientY);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  // Ouvrir les HUDs au click ou touch
  useEffect(() => {
    const handleInteraction = (event) => {
      let clientX, clientY;
      if (event.type === "touchstart") {
        event.preventDefault();
        const touch = event.touches[0];
        clientX = touch.clientX;
        clientY = touch.clientY;
      } else {
        clientX = event.clientX;
        clientY = event.clientY;
      }
      const rect = gl.domElement.getBoundingClientRect();
      mouse.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse.current, camera);
      const screens = [
        screenRef1.current,
        screenRef2.current,
        screenRef3.current,
      ].filter(Boolean);
      const intersects = raycaster.intersectObjects(screens);
      if (intersects.length === 0) return;

      const mesh = intersects[0].object;
      if (mesh === screenRef1.current) setHud1Open();
      if (mesh === screenRef2.current) setHud2Open();
      if (mesh === screenRef3.current) setHud3Open();
    };

    gl.domElement.addEventListener("click", handleInteraction);
    gl.domElement.addEventListener("touchstart", handleInteraction, {
      passive: false,
    });

    return () => {
      gl.domElement.removeEventListener("click", handleInteraction);
      gl.domElement.removeEventListener("touchstart", handleInteraction);
    };
  }, [camera, raycaster, gl, setHud1Open, setHud2Open, setHud3Open]);

  // Gestion du hover et du glow
  useFrame(() => {
    // mettre à jour depuis la caméra et la souris
    raycaster.setFromCamera(mouse.current, camera);
    const screens = [
      screenRef1.current,
      screenRef2.current,
      screenRef3.current,
    ].filter(Boolean);
    const intersects = raycaster.intersectObjects(screens);
    // hover
    const newHovered = intersects.length > 0 ? intersects[0].object : null;
    if (newHovered !== hoveredMesh) {
      setHoveredMesh(newHovered);
    }
    // mettre à jour la lueur émissive
    screens.forEach((mesh) => {
      if (!mesh.material) return;
      mesh.material.emissiveIntensity = mesh === newHovered ? 1 : 0.4;
    });
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
        scale={isMobile ? 0.4 : 0.75}
        position={isMobile ? [0, -3, -0.6] : [0, -3.25, -1.1]}
        rotation={[-0.01, -0.2, -0.1]}
        castShadow
        receiveShadow
      />
    </group>
  );
};

export default GamingSetup;
