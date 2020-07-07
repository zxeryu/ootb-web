import { createBootstrap } from "../core/bootstrap";
import { conf } from "./config";
import App from "./App";
import React from "react";
import { CSSPreset } from "./CSSPreset";
import { ThemeProvider } from "../core/style/Theme";

const SetUp = () => (
  <ThemeProvider>
    <CSSPreset>
      <App />
    </CSSPreset>
  </ThemeProvider>
);

createBootstrap(conf())(() => <SetUp />, document.getElementById("root") as Element);
