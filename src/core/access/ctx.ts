import { createContext, useContext } from "react";

const AccessControlContext = createContext({
  permissions: {},
  attrs: {},
} as {
  permissions?: { [k: string]: boolean };
  attrs?: { [k: string]: string[] };
});

export const AccessControlProvider = AccessControlContext.Provider;

export const useAccessControl = () => useContext(AccessControlContext);
