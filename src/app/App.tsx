import React from "react";
import { RouteMeta, SwitchRoutes } from "../core/route";
import { getSettingRoutes } from "./setting/routes";
import { getOverviewRoutes } from "./overview/routes";
import "antd/dist/antd.css";
import { Main } from "../modules/Main";

const root = RouteMeta.with({ fullPath: "/" }).withChildren(getSettingRoutes(), getOverviewRoutes());

function App() {
  return <Main route={root} />;
}

export default App;
