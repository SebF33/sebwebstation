import React from "react";
import { styles } from "../styles";

import StationCanvas from "./canvas/StationCanvas";

const Home = () => {
  return (
    <section className="relative w-full h-screen mx-auto overflow-hidden">
      <div
        className={`absolute inset-0 top-[120px] max-w-7xl mx-auto ${styles.paddingX} flex flex-row items-start gap-5`}
      >
        <div className="flex flex-col justify-center items-center mt-5">
          <div className="w-5 h-5 rounded-full bg-[#9E1313]" />
          <div className="w-1 sm:h-80 h-40 bg-gradient-to-b from-[#9E1313] via-[#660000] to-[#330000]" />
        </div>
        <div>
          <h1 className={`${styles.headText} sw-font text-white`}>
            Salut, je suis{" "}
            <span className="sw-font text-[#9E1313]">Sébastien</span>
          </h1>
          <p
            className={`${styles.subText} mt-2 text-white max-w-xl text-base leading-relaxed`}
          >
            HTML, CSS, JavaScript, PHP &amp; MySQL : les 5 piliers sur lesquels
            s'appuient mes travaux.
          </p>
        </div>
      </div>
      <StationCanvas />
    </section>
  );
};

export default Home;
