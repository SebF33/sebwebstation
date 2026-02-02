// src/components/VideoPlayer.jsx
import React, { useRef, useEffect } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

videojs.addLanguage("fr", {
  "The media could not be loaded, either because the server or network failed or because the format is not supported.":"La vidéo n'est pas disponible.",
});

const VideoPlayer = ({ src, poster, options = {} }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (playerRef.current) return;

    const videoElement = videoRef.current;
    if (!videoElement) return;

    // Options par défaut + override
    const videoJsOptions = {
      language: "fr",
      controls: true,
      fluid: true,
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
