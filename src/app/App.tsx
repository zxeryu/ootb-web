import React from "react";
import { Counter } from "./Counter";
import { Age } from "./Age";
import { RouteMeta, SwitchRoutes } from "../core/route";
import { getSettingRoutes } from "./setting/routes";

const root = RouteMeta.with({ fullPath: "/" }).withChildren(getSettingRoutes());

function App() {
  return (
    <div>
      <Counter />
      <Age />
      <SwitchRoutes route={root} />
    </div>
  );
}

export default App;
