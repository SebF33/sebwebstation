// src/components/canvas/CanvasLoader.jsx
import { Html, useProgress } from "@react-three/drei";

const CanvasLoader = () => {
  const { progress } = useProgress();
  return (
    <Html as="div" center>
      <div className="loader-container">
        <div className="loader-spinner" />
        <p className="loader-text">{Math.round(progress)}%</p>
      </div>
    </Html>
  );
};

export default CanvasLoader;
