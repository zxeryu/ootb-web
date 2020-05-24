import { ComponentType, createContext, ReactNode, useContext } from "react";

export interface IRoute<TParameters> {
  location: Location;
  match: IMatch<TParameters>;
}

export interface IRouterContext<TParameters = any> extends IRoute<TParameters> {
  history: History;
}

export interface IMatch<TParameters> {
  params: TParameters;
  isExact: boolean;
  path: string;
  url: string;
}

export interface IRouteProps {
  path?: string | string[];
  exact?: boolean;
  strict?: boolean;
  sensitive?: boolean;
  component?: ComponentType<IRouterContext<any>>;
  location?: any;
  render?: (props: IRouterContext<any>) => ReactNode;
  children?: (props: IRouterContext<any>) => ReactNode;

  // from switch
  // don't use this for manual
  computedMatch?: IMatch<any>;
}

const RouterContext = createContext({} as IRouterContext<any>);

export const RouterProvider = RouterContext.Provider;

export function useRouter<TParameters = any>() {
  return useContext<IRouterContext<TParameters>>(RouterContext);
}
