// src/components/canvas/StationCanvas.jsx
import React, {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Html,
  OrbitControls,
  Preload,
  Sparkles,
  Stars,
  useGLTF,
} from "@react-three/drei";
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Noise,
} from "@react-three/postprocessing";
import { MathUtils, Quaternion, Vector3 } from "three";
import { motion, AnimatePresence } from "motion/react";
import { technologies } from "../../utils/constants";

import CanvasLoader from "./CanvasLoader";
import GamingSetup from "./GamingSetup";
import TechList from "../TechList";
import VideoPlayer from "../VideoPlayer";

/**
 * Calcule les 4 coins du viewport à une distance donnée de la caméra
 * @param {Camera} camera - Caméra de la scène
 * @param {number} distance - Distance le long du rayon de projection (par défaut 100)
 * @returns {Vector3[]} - Positions world des coins [bas-gauche, haut-gauche, haut-droite, bas-droite]
 */
function computeCorners(camera, distance = 100) {
  const camPos = camera.position.clone();
  const ndc = [
    new Vector3(-1, -1, -1), // bas-gauche du near plane
    new Vector3(-1, 1, -1), // haut-gauche du near plane
    new Vector3(1, 1, -1), // haut-droite du near plane
    new Vector3(1, -1, -1), // bas-droite du near plane
  ];
  return ndc.map((n) => {
    // unproject sur le near plane
    const worldPoint = n.clone().unproject(camera);
    // vecteur depuis la caméra vers le point
    const dir = worldPoint.sub(camPos).normalize();
    // position à la distance donnée sur ce vecteur
    return camPos.clone().addScaledVector(dir, distance);
  });
}

/**
 * SpaceFighter
 * - anime un vaisseau entre deux coins opposés aléatoires
 * - délai initial et avant chaque respawn
 */
function SpaceFighter({ modelPath, speed, scale, delay, corners }) {
  const gltf = useGLTF(modelPath);
  const mesh = useRef();

  // trajectoire
  const spawn = useRef(new Vector3());
  const target = useRef(new Vector3());
  const dir = useRef(new Vector3());
  const dist = useRef(0);
  const quat = useRef(new Quaternion());
  const traveled = useRef(0);
  const respawnTO = useRef();
  const [visible, setVisible] = useState(false);

  // sélection aléatoire de coins opposés
  const pickCorners = () => {
    const idx = MathUtils.randInt(0, corners.length - 1);
    return {
      spawn: corners[idx].clone(),
      target: corners[(idx + 2) % corners.length].clone(),
    };
  };

  // initialise trajectoire + position et orientation du mesh
  const initTrajectory = () => {
    const pts = pickCorners();
    spawn.current.copy(pts.spawn);
    target.current.copy(pts.target);
    dir.current.copy(pts.target).sub(pts.spawn).normalize();
    dist.current = pts.spawn.distanceTo(pts.target);
    quat.current.setFromUnitVectors(new Vector3(0, 0, 1), dir.current);
    // position et orientation initiale avant affichage
    if (mesh.current) {
      mesh.current.position.copy(spawn.current);
      mesh.current.quaternion.copy(quat.current);
    }
    traveled.current = 0;
  };

  // planifie respawn : cache, attend, ré-init, ré-affiche
  const scheduleRespawn = () => {
    setVisible(false);
    respawnTO.current = setTimeout(() => {
      initTrajectory();
      setVisible(true);
    }, delay * 1000);
  };

  // au montage
  useLayoutEffect(() => {
    initTrajectory();
    // délai avant première apparition
    const id = setTimeout(() => setVisible(true), delay * 1000);
    return () => {
      clearTimeout(id);
      clearTimeout(respawnTO.current);
    };
  }, [delay, corners]);

  // animation : déplacement et trigger respawn
  useFrame((_, delta) => {
    if (!visible || !mesh.current) return;
    const step = speed * delta;
    mesh.current.position.addScaledVector(dir.current, step);
    traveled.current += step;
    mesh.current.quaternion.copy(quat.current);
    if (traveled.current >= dist.current) scheduleRespawn();
  });

  // rendu : mesh toujours monté, visibilité gérée via prop
  return (
    <primitive
      ref={mesh}
      object={gltf.scene.clone()}
      scale={scale}
      dispose={null}
      visible={visible}
    />
  );
}

/**
 * SpaceSceneContent
 * - calcule les coins du viewport
 * - rend fond d'étoiles et fighters
 */
function SpaceSceneContent({ configs }) {
  const camera = useThree((state) => state.camera);
  // recalculer uniquement si la caméra change
  const corners = useMemo(() => computeCorners(camera, 100), [camera]);

  return (
    <>
      {/* Fond étoilé */}
      <Stars
        count={10000}
        depth={300}
        factor={10}
        fade
        radius={250}
        speed={0.02}
        saturation={0}
      />
      <Stars
        count={5000}
        depth={200}
        factor={5}
        fade
        radius={200}
        speed={0.05}
        saturation={0.3}
      />
      <Stars
        count={2000}
        depth={100}
        factor={2}
        fade
        radius={150}
        speed={0.1}
        saturation={0.6}
      />
      <Sparkles
        count={500}
        size={1.5}
        scale={[200, 200, 200]}
        speed={0.5}
        noise={0.2}
        position={[0, 0, 0]}
      />
      {/* Fighter pour chaque config */}
      {configs.map((cfg, i) => (
        <SpaceFighter key={i} {...cfg} corners={corners} />
      ))}
    </>
  );
}

// Éviter les rerenders inutiles
const Space = React.memo(SpaceSceneContent);

const StationCanvas = () => {
  const [hud1Open, setHud1Open] = useState(false);
  const [hud2Open, setHud2Open] = useState(false);
  const [hud3Open, setHud3Open] = useState(false);
  const [repos, setRepos] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  // Repos GitHub
  useEffect(() => {
    fetch("https://api.github.com/users/sebf33/repos")
      .then((res) => res.json())
      .then((data) => {
        // on retire les archivés
        const active = data.filter((r) => !r.archived);
        // on retire le repo "sebf33"
        const withoutSelf = active.filter((r) => r.name !== "sebf33");
        // on trie par date de dernier push
        const sorted = withoutSelf.sort(
          (a, b) => new Date(b.pushed_at) - new Date(a.pushed_at)
        );
        setRepos(sorted);
      })
      .catch((err) => console.error(err));
  }, []);

  // Détecter mobile et fermer automatiquement les HUDs en cas de changement
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 500px)");
    const handleResize = (e) => {
      setIsMobile(e.matches);
      setHud1Open(false);
      setHud2Open(false);
      setHud3Open(false);
    };
    setIsMobile(mq.matches);
    mq.addEventListener("change", handleResize);
    return () => mq.removeEventListener("change", handleResize);
  }, []);

  // Bloquer l'ouverture de plusieurs HUDs
  const anyHudOpen = hud1Open || hud2Open || hud3Open;
  const openHud1 = () => {
    if (anyHudOpen) return;
    setHud1Open(true);
  };
  const openHud2 = () => {
    if (anyHudOpen) return;
    setHud2Open(true);
  };
  const openHud3 = () => {
    if (anyHudOpen) return;
    setHud3Open(true);
  };

  // Config des fighters
  const fightersConfig = useMemo(
    () => [
      {
        modelPath: "./models/tie_fighter/scene.gltf",
        speed: 10,
        scale: 0.003,
        delay: MathUtils.randFloat(2, 8),
      },
      {
        modelPath: "./models/x-wing/scene.gltf",
        speed: 9,
        scale: 0.02,
        delay: MathUtils.randFloat(3, 11),
      },
    ],
    []
  );

  return (
    <Canvas
      frameloop="always"
      shadows
      dpr={[1, 2]}
      camera={{ position: [20, 3, 5], fov: 25 }}
      gl={{ preserveDrawingBuffer: true }}
    >
      <Suspense fallback={<CanvasLoader />}>
        <Space configs={fightersConfig} />
        <OrbitControls
          autoRotate
          autoRotateSpeed={0.1}
          enablePan={false}
          enableZoom={true}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
        <GamingSetup
          isMobile={isMobile}
          setHud1Open={openHud1}
          setHud2Open={openHud2}
          setHud3Open={openHud3}
        />
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
        {/* HUD 1 : YouTube */}
        <AnimatePresence>
          {hud1Open && (
            <Html center>
              <motion.div
                className="hud-popup hud-popup--smartphone"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  className="hud-close"
                  onClick={() => setHud1Open(false)}
                >
                  ✕
                </button>
                <motion.h2
                  className="hud-title sw-font"
                  animate={{
                    textShadow: [
                      "0 0 4px #0ff",
                      "0 0 12px #0ff",
                      "0 0 4px #0ff",
                    ],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut",
                  }}
                >
                  YouTube
                </motion.h2>
                <motion.p
                  className="hud-text typewriter"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{
                    duration: 2.5,
                    ease: "linear",
                  }}
                >
                  Regardez ma stack technique sur ma chaîne&nbsp;
                  <a
                    href="https://www.youtube.com/@ifseb"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hud-link"
                  >
                    @ifseb
                  </a>
                  .
                </motion.p>
                <div className="mx-auto">
                  <VideoPlayer
                    src="./videos/creativite.mp4"
                    poster="./img/creativite.png"
                    options={{ autoplay: true, loop: true, muted: false }}
                  />
                </div>
              </motion.div>
            </Html>
          )}
        </AnimatePresence>
        {/* HUD 2 : GitHub */}
        <AnimatePresence>
          {hud2Open && (
            <Html center>
              <motion.div
                className="hud-popup hud-popup--laptop"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  className="hud-close"
                  onClick={() => setHud2Open(false)}
                >
                  ✕
                </button>
                <motion.h2
                  className="hud-title sw-font"
                  animate={{
                    textShadow: [
                      "0 0 4px #0ff",
                      "0 0 12px #0ff",
                      "0 0 4px #0ff",
                    ],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut",
                  }}
                >
                  GitHub
                </motion.h2>
                <motion.p
                  className="hud-text typewriter"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{
                    duration: 2.5,
                    ease: "linear",
                  }}
                >
                  Découvrez mes projets en vidéo ou sur&nbsp;
                  <a
                    href="https://github.com/sebf33"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hud-link"
                  >
                    SebF33
                  </a>
                  .
                </motion.p>
                <div className="repo-list">
                  {repos.map((repo, idx) => (
                    <motion.div
                      key={repo.id}
                      className="repo-item"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1, duration: 0.4 }}
                    >
                      <h3 className="repo-title">
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hud-link"
                        >
                          {repo.name}
                        </a>
                        {repo.homepage && (
                          <a
                            href={repo.homepage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="deathstar-icon"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 64 64"
                            >
                              <circle
                                cx="32"
                                cy="32"
                                r="30"
                                stroke="#ff1a1a"
                                strokeWidth="2"
                                fill="none"
                              />
                              <circle cx="44" cy="20" r="6" fill="#ff1a1a" />
                              <line
                                x1="2"
                                y1="32"
                                x2="62"
                                y2="32"
                                stroke="#ff1a1a"
                                strokeWidth="1"
                              />
                              <line
                                x1="32"
                                y1="2"
                                x2="32"
                                y2="62"
                                stroke="#ff1a1a"
                                strokeWidth="1"
                              />
                              <path
                                d="M2 32 A30 30 0 0 1 62 32"
                                stroke="#ff1a1a"
                                strokeWidth="1"
                                fill="none"
                              />
                            </svg>
                          </a>
                        )}
                      </h3>
                      <VideoPlayer
                        src={`./videos/${repo.name}.mp4`}
                        poster={`./img/${repo.name}.png`}
                        options={{
                          autoplay: idx === 0,
                          loop: true,
                          muted: true,
                        }}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </Html>
          )}
        </AnimatePresence>
        {/* HUD 3 : Code */}
        <AnimatePresence>
          {hud3Open && (
            <Html center>
              <motion.div
                className="hud-popup hud-popup--screen"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  className="hud-close"
                  onClick={() => setHud3Open(false)}
                >
                  ✕
                </button>
                <motion.h2
                  className="hud-title sw-font"
                  animate={{
                    textShadow: [
                      "0 0 4px #0ff",
                      "0 0 12px #0ff",
                      "0 0 4px #0ff",
                    ],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut",
                  }}
                >
                  Code
                </motion.h2>
                <motion.p
                  className="hud-text typewriter"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.5, ease: "linear" }}
                >
                  Jugez les technologies déjà utilisées...
                </motion.p>
                <TechList technologies={technologies} />
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
