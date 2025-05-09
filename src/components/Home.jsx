// src/components/Home.jsx
import React from "react";
import { styles } from "../styles";

import StationCanvas from "./canvas/StationCanvas";

const Home = () => {
  return (
    <section className="relative w-full h-screen mx-auto overflow-hidden">
      <div
        className={`absolute inset-0 top-[30px] md:top-[120px] max-w-7xl mx-auto ${styles.paddingX} flex flex-row items-start gap-5`}
      >
        <div className="flex flex-col justify-center items-center mt-5">
          <div className="w-5 h-5 rounded-full bg-lighter-sith" />
          <div
            className="w-1 sm:h-80 h-52
             bg-gradient-to-b
             from-lighter-sith
             to-lighter-jedi"
          />
        </div>
        <div>
          <h1 className={`${styles.headText} sw-font text-white leading-10`}>
            Salut, je suis{" "}
            <span className="sw-font text-lighter-sith">Sébastien</span>
          </h1>
          <p
            className={`${styles.subText} mt-2 text-white max-w-2xl text-base leading-6`}
          >
            <span className="text-[#E44D26]">HTML</span>,{" "}
            <span className="text-[#1572B6]">CSS</span>,{" "}
            <span className="text-[#FFDA3E]">JavaScript</span>,{" "}
            <span className="text-[#7E93D1]">PHP</span> &amp;{" "}
            <span className="text-[#00758F]">MySQL</span> : découvre sur les
            écrans mes travaux issus de ces 5 piliers fondateurs.
          </p>
        </div>
      </div>
      <StationCanvas />
    </section>
  );
};

export default Home;
