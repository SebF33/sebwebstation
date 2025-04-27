// src/components/TechList.jsx
import React, { useState } from "react";

// Chargement des images
function ImageWithLoader({ src, alt, className }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="tech-image-wrapper">
      {!loaded && <div className="tech-icon-loader"></div>}
      <img
        src={src}
        alt={alt}
        className={`${className} ${loaded ? "visible" : "hidden"}`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

export default function TechList({ technologies }) {
  const languages = technologies.filter((t) => t.category === "language");
  const runtimes = technologies.filter((t) => t.category === "runtime");
  const sgbds = technologies.filter((t) => t.category === "sgbd");
  const frameworks = technologies.filter((t) => t.category === "framework");
  const libraries = technologies.filter((t) => t.category === "library");

  const renderGroup = (items, title) => (
    <div className="tech-group">
      <h3 className="tech-group-title">{title}</h3>
      <div className="tech-group-items">
        {items.map((tech) => (
          <div key={tech.name} className="tech-item">
            <ImageWithLoader
              src={tech.icon}
              alt={tech.name}
              className="tech-icon"
            />
            <p className="tech-label">{tech.name}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="tech-list">
      {renderGroup(languages, "Langages")}
      <div className="tech-separator" />
      {renderGroup(runtimes, "Environnements d'exécution")}
      <div className="tech-separator" />
      {renderGroup(sgbds, "SGBD")}
      <div className="tech-separator" />
      {renderGroup(frameworks, "Frameworks")}
      <div className="tech-separator" />
      {renderGroup(libraries, "Librairies")}
    </div>
  );
}
