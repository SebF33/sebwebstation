// src/components/VideoPlayer.jsx
import React, { useRef, useEffect } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

const VideoPlayer = ({ src, poster, options = {} }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (playerRef.current) return;

    const videoElement = videoRef.current;
    if (!videoElement) return;

    // Options par défaut + override
    const videoJsOptions = {
      controls: true,
      fluid: true,
      notSupportedMessage: "La vidéo n'est pas disponible.",
      preload: "auto",
      sources: [{ src, type: "video/mp4" }],
      poster: poster || "",
      ...options,
    };

    // Initialisation
    playerRef.current = videojs(videoElement, videoJsOptions);

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [src, options, poster]);

  return (
    <div data-vjs-player>
      <video ref={videoRef} className="video-js vjs-default-skin" />
    </div>
  );
};

export default VideoPlayer;
