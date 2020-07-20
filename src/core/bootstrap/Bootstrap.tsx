import React, { ReactElement, ReactNode, StrictMode, useEffect, useMemo } from "react";
import { Store, StoreProvider, useStore } from "../store";
import { createPersister } from "../storage";
import { createBrowserHistory } from "history";
import { Router } from "react-router-dom";
import { BaseConfig, ConfigProvider } from "../config";
import ReactDOM from "react-dom";
import { isFunction } from "lodash";
import { AxiosProvider, baseURLsFromConfig } from "../request";

function PersisterConnect({ persister }: { persister: ReturnType<typeof createPersister> }) {
  const store$ = useStore();

  useEffect(() => {
    const cleanup = persister.connect(store$);

    return () => {
      cleanup();
    };
  }, []);

  return null;
}

const HistoryProvider = ({ children }: { children: ReactNode }) => {
  const history = useMemo(() => createBrowserHistory(), []);
  return <Router history={history}>{children}</Router>;
};

export const createBootstrap = <T extends BaseConfig>(config: T) => (
  e: ReactElement | (() => ReactElement),
  $root: Element,
) => {
  const persister = createPersister({
    name: config.appName || "app",
  });
  persister.hydrate((storeValues = {}) => {
    const store$ = Store.create(storeValues);
    ReactDOM.render(
      <StrictMode>
        <StoreProvider value={store$}>
          <ConfigProvider value={{ config }}>
            <AxiosProvider baseURLs={baseURLsFromConfig(config)}>
              <PersisterConnect persister={persister} />
              <HistoryProvider>{isFunction(e) ? e() : e}</HistoryProvider>
            </AxiosProvider>
          </ConfigProvider>
        </StoreProvider>
      </StrictMode>,
      $root,
    );
  });
};
