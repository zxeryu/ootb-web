import { createBootstrap } from "../core/bootstrap";
import { conf } from "./config";
import App from "./App";
import React from "react";

createBootstrap(conf())(() => <App />, document.getElementById("root") as Element);
