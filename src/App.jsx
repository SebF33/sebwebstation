// src/App.jsx
import React from "react";
import { BrowserRouter } from "react-router-dom";

import Home from "./components/Home";

const App = () => {
  return (
    <BrowserRouter>
      <div className="relative z-0">
        <Home />
      </div>
    </BrowserRouter>
  );
};

export default App;
