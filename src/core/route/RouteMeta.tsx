import React, {
  ReactNode,
  FunctionComponent,
  useMemo,
  ReactElement,
  createElement,
  ComponentType,
  lazy,
  Suspense,
  Children,
} from "react";
import { startsWith, forEach, map, assign, concat } from "lodash";
import { Switch, Route } from "react-router-dom";

export interface IRouteMeta {
  fullPath?: string;
  index?: boolean;
  path?: string;
  title?: ReactNode;
  icon?: ReactNode;
  content?: ComponentType<any>;
  render?: FunctionComponent<{ children: ReactNode }>;
  parent?: RouteMeta;
  children?: Array<RouteMeta>;
}

export class RouteMeta implements IRouteMeta {
  children: Array<RouteMeta> | undefined;
  content: ComponentType<any> | undefined;
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

  static with(props: {
    index?: boolean;
    title?: string | ReactNode;
    icon?: ReactNode;
    path?: string;
    fullPath?: string;
  }) {
    if (props.title && typeof props.title === "string") {
      props.title = <span>{props.title}</span>;
    }
    const { index, title, icon, path, fullPath } = props;
    return new RouteMeta({ index, title, icon, path, fullPath });
  }

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

  withContent(content: ComponentType<any>) {
    return this.set("content", content);
  }

  withDynamic(content: () => Promise<{ default: ComponentType<any> }>) {
    return this.set("content", load(content));
  }

  shouldRender(render: IRouteMeta["render"]) {
    return this.set("render", render);
  }

  withChildren(...routes: IRouteMeta[]) {
    return this.set("children", concat(this.children, routes));
  }
}

export const load = <T extends ComponentType>(factory: () => Promise<{ default: T }>, fallback = <></>) => {
  const Comp = lazy(factory);

  const Dynamic = (props: any) => (
    <Suspense fallback={fallback}>
      <Comp {...props} />
    </Suspense>
  );

  return Dynamic;
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
  const Comp = route.content || SwitchRoutes;
  return (
    <>
      {createElement(route.render || persistentRender || defaultRender, {
        children: <Comp route={route} />,
      })}
    </>
  );
};

export const EachRoutes = ({ route, children }: { route: IRouteMeta; children: (route: IRouteMeta) => ReactNode }) => {
  const routes = useMemo(() => {
    const routes: Array<ReactElement<any>> = [];
    forEach(route.children, (e) => {
      //设置fullPath
      !e.fullPath && (e.fullPath = resolveFullPath(e.path || "", route.fullPath));
      // const r = cloneElement(<RouteRender route={e} parent={route} />, {
      //   content: children(e),
      // });
      const r = createElement(e.render || route.render || defaultRender, {
        children: children(e),
        key: e.path,
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
    return Children.toArray(resolveChildren(route));
  }, route.children);

  return <Switch>{routes}</Switch>;
};
