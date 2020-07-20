import { parse } from "querystring";
import { createContext, useContext } from "react";

export type BaseConfig = { appName: string; env: string; version: string };

const ConfigContext = createContext<{ config: any }>({ config: {} as any });

export const ConfigProvider = ConfigContext.Provider;
export const useConfig = <T extends BaseConfig>(): T => useContext(ConfigContext).config || {};

const getDevKitValue = (key: string) => {
  return globalThis.document?.querySelector(`meta[name="${key}"]`)?.getAttribute("content") || "";
};

export function confLoader<TKeys extends string>(alias: string) {
  const app = parse(getDevKitValue(`${alias}:app`), ",", "=", {
    decodeURIComponent: (v) => v,
  });

  const config = parse(getDevKitValue(`${alias}:config`), ",", "=", {
    decodeURIComponent: (v) => v,
  });

  const conf = (): { [key in TKeys]: string } & BaseConfig => {
    return {
      ...config,
      ...app,
    } as any;
  };

  const useConfigWithTypes = () => useConfig<ReturnType<typeof conf>>();

  conf.useConfig = useConfigWithTypes;

  return conf;
}
