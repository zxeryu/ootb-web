import { createBootstrap } from "../core/bootstrap";
import { APP_CONFIG } from "./config";
import App from "./App";
import React from "react";
import { CSSPreset } from "./CSSPreset";
import { ThemeProvider } from "../core/style/Theme";
import { confLoader } from "../core/config";

const conf = confLoader<keyof typeof APP_CONFIG>();

const SetUp = () => (
  <ThemeProvider>
    <CSSPreset>
      <App />
    </CSSPreset>
  </ThemeProvider>
);

createBootstrap(conf())(() => <SetUp />, document.getElementById("root") as Element);
