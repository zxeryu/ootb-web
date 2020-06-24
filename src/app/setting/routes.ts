import { RouteMeta } from "../../core/route";
import { MainAdmin } from "../../modules/Main";

export const getSettingRoutes = () => {
  return RouteMeta.with({ path: "setting", title: "设置" })
    .withContent(MainAdmin)
    .withChildren(
      RouteMeta.with({ path: "access", title: "权限" }).withDynamic(() => import("./access")),
      RouteMeta.with({ path: "people", title: "人" }).withDynamic(() => import("./people")),
    );
};
