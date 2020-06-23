import React from "react";
import { RouteMeta, SwitchRoutes } from "../core/route";
import { getSettingRoutes } from "./setting/routes";
import { getOverviewRoutes } from "./overview/routes";
import { BasicLayout } from "../component/layout/BasicLayout";
import "antd/dist/antd.css";

const root = RouteMeta.with({ fullPath: "/" }).withChildren(getSettingRoutes(), getOverviewRoutes());

function App() {
  return (
    <BasicLayout route={root}>
      <SwitchRoutes route={root} />
    </BasicLayout>
  );
}

export default App;
