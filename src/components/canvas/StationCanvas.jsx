import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  ContactShadows,
  Html,
  OrbitControls,
  Preload,
  Stars,
} from "@react-three/drei";
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Noise,
} from "@react-three/postprocessing";
import { motion, AnimatePresence } from "motion/react";

import CanvasLoader from "./CanvasLoader";
import GamingSetup from "./GamingSetup";

const StationCanvas = () => {
  const [hudOpen, setHudOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 500px)");
    setIsMobile(mq.matches);
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <Canvas
      frameloop="always"
      shadows
      dpr={[1, 2]}
      camera={{ position: [20, 3, 5], fov: 25 }}
      gl={{ preserveDrawingBuffer: true }}
    >
      <Suspense fallback={<CanvasLoader />}>
        <Stars
          count={12000}
          depth={150}
          factor={4}
          fade
          radius={200}
          speed={0.2}
        />
        <OrbitControls
          autoRotate
          autoRotateSpeed={0.15}
          enablePan={false}
          enableZoom={true}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
        <GamingSetup isMobile={isMobile} setHudOpen={setHudOpen} />
        <ContactShadows
          position={[0, -3.5, 0]}
          opacity={0.3}
          width={10}
          height={10}
          blur={1}
          far={4}
        />
        <EffectComposer>
          <Bloom
            height={300}
            luminanceThreshold={0.8}
            luminanceSmoothing={0.5}
            mipmapBlur
          />
          <ChromaticAberration offset={[0.0003, 0.0003]} />
          <Noise opacity={0.02} />
        </EffectComposer>

        {/* HUD */}
        <AnimatePresence>
          {hudOpen && (
            <Html center>
              <motion.div
                className="hud-popup"
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                initial={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <button className="hud-close" onClick={() => setHudOpen(false)}>
                  ✕
                </button>
                <h2 className="hud-title sw-font">YouTube</h2>
                <p className="hud-text">
                  Découvrez mes projets sur ma chaîne&nbsp;
                  <a
                    href="https://www.youtube.com/@ifseb"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hud-link"
                  >
                    @ifseb
                  </a>
                  .
                </p>
              </motion.div>
            </Html>
          )}
        </AnimatePresence>
      </Suspense>
      <Preload all />
    </Canvas>
  );
};

export default StationCanvas;
