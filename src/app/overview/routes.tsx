import { RouteMeta } from "../../core/route";
import { Home, Some } from "./comp";

export const getOverviewRoutes = () => {
  return RouteMeta.with({ path: "overview", title: "overview" }).withChildren(
    RouteMeta.with({ path: "home", title: "home" }).withContent(Home),
    RouteMeta.with({ path: "some", title: "some" }).withContent(Some),
  );
};
