import { RouteMeta } from "../../core/route";

export const getSettingRoutes = () => {
  return RouteMeta.with({ path: "setting" }).withChildren(
    RouteMeta.with({ path: "access" }).withContent(() => import("./access")),
    RouteMeta.with({ path: "people" }).withContent(() => import("./people")),
  );
};
