import React, {
  ReactNode,
  FunctionComponent,
  useMemo,
  ReactElement,
  createElement,
  cloneElement,
  ComponentType,
  lazy,
  Suspense,
} from "react";
import { startsWith, forEach, map, assign, get, isFunction, concat } from "lodash";
import { Switch, Route } from "react-router-dom";

export interface IRouteMeta {
  fullPath?: string;
  index?: boolean;
  path?: string;
  title?: ReactNode;
  icon?: ReactNode;
  content?: ReactNode;
  render?: FunctionComponent<{ children: ReactNode }>;
  parent?: RouteMeta;
  children?: Array<RouteMeta>;
}

export class RouteMeta implements IRouteMeta {
  children: Array<RouteMeta> | undefined;
  content: React.ReactNode;
  fullPath: string | undefined;
  icon: React.ReactNode;
  index: boolean | undefined;
  parent: RouteMeta | undefined;
  path: string | undefined;
  render:
    | React.FunctionComponent<{
        children: React.ReactNode;
      }>
    | undefined;
  title: React.ReactNode;

  constructor(route: IRouteMeta) {
    this.content = route.content;
    this.fullPath = route.fullPath;
    this.icon = route.icon;
    this.title = route.title;
    this.path = route.path;
    this.render = route.render;
    this.parent = route.parent;
    this.index = route.index;
    this.children = map(route.children, (subRoute: RouteMeta) => subRoute.setParent(this));
  }

  private set(key: keyof RouteMeta, value: any) {
    return new RouteMeta(assign({}, this, { [key]: value }));
  }

  private setParent(route: RouteMeta) {
    return this.set("parent", route);
  }

  with(props: { index?: boolean; title?: string | ReactNode; icon?: ReactNode; path?: string; fullPath?: string }) {
    let routeMeta: RouteMeta | undefined;
    //convert title to ReactNode while is string
    if (props.title && typeof props.title === "string") {
      props.title = <span>{props.title}</span>;
    }
    for (const key in props) {
      routeMeta = this.set(key as any, get(props, key));
    }
    return routeMeta || this;
  }

  withContent(content: (() => Promise<{ default: ComponentType<any> }>) | ReactNode) {
    return this.set("content", isFunction(content) ? load(content) : content);
  }

  shouldRender(render: IRouteMeta["render"]) {
    return this.set("render", render);
  }

  withChildren(children: IRouteMeta["children"]) {
    return this.set("children", concat(this.children, children));
  }
}

export const load = <T extends ComponentType>(factory: () => Promise<{ default: T }>, fallback = <></>) => {
  const Comp = lazy(factory);

  const Dynamic = (props: any) => (
    <Suspense fallback={fallback}>
      <Comp {...props} />
    </Suspense>
  );

  return <Dynamic />;
};

const resolveFullPath = (pathname?: string, parentPathname = "/") => {
  if (!pathname) {
    return parentPathname;
  }

  if (pathname === "*") {
    return "(.*)";
  }

  if (startsWith(pathname, "/")) {
    return pathname;
  }

  return `${parentPathname === "/" ? "" : parentPathname}/${pathname}`;
};

export const isVirtualRoute = (routeMeta: IRouteMeta) => {
  return !routeMeta.path && !routeMeta.index;
};

const defaultRender = ({ children }: { children: ReactNode }) => <>{children}</>;

export const RouteRender = ({ route, parent }: { route: IRouteMeta; parent: IRouteMeta }) => {
  const { render: persistentRender } = parent;
  return (
    <>
      {createElement(route.render || persistentRender || defaultRender, {
        children: route.content || <SwitchRoutes route={route} />,
      })}
    </>
  );
};

export const EachRoutes = ({ route, children }: { route: IRouteMeta; children: (route: IRouteMeta) => ReactNode }) => {
  const routes = useMemo(() => {
    const routes: Array<ReactElement<IRouteMeta>> = [];
    forEach(route.children, (e) => {
      //设置fullPath
      !e.fullPath && (e.fullPath = resolveFullPath(e.path || "", route.fullPath));
      const r = cloneElement(<RouteRender route={e} parent={route} />, {
        content: children(e),
      });
      routes.push(r);
    });
    return routes;
  }, route.children);
  return <>{routes}</>;
};

//switch RouteTree to <Route/>
export const SwitchRoutes = ({ route }: { route: IRouteMeta }) => {
  const routes = useMemo(() => {
    const resolveChildren = (route: IRouteMeta) => {
      const routes: Array<ReactElement<IRouteMeta>> = [];
      const virtualRoutes: Array<ReactElement<IRouteMeta>> = [];

      forEach(route.children, (e: IRouteMeta) => {
        if (isVirtualRoute(e)) {
          routes.push(...resolveChildren(e));
        } else {
          //设置fullPath
          !e.fullPath && (e.fullPath = resolveFullPath(e.path || "", route.fullPath));
          routes.push(
            <Route path={e.fullPath} exact={e.index}>
              <RouteRender route={e} parent={route} />
            </Route>,
          );
        }
      });
      return [...routes, ...virtualRoutes];
    };
    return resolveChildren(route);
  }, route.children);

  return <Switch>{routes}</Switch>;
};
