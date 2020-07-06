import { createBootstrap } from "../core/bootstrap";
import { conf } from "./config";
import App from "./App";
import React from "react";
import { CSSPreset } from "./CSSPreset";

const SetUp = () => (
  <CSSPreset>
    <App />
  </CSSPreset>
);

createBootstrap(conf())(() => <SetUp />, document.getElementById("root") as Element);
