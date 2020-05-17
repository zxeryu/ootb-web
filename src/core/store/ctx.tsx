import React, { createContext, useContext } from "react";
import { Store } from "./core";

const StoreContext = createContext({} as Store<any>);

export const StoreProvider = StoreContext.Provider;

export const useStore = () => {
  return useContext(StoreContext);
};
