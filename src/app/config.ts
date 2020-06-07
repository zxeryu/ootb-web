import { confLoader } from "../core/config";

export const ENVS = {
  STAGING: "staging",
  DEMO: "demo",
  LOCAL: "local",
  ONLINE: "online",
};

export const APP_CONFIG = {
  TITLE: () => {
    return "start";
  },
};

export const conf = confLoader<keyof typeof APP_CONFIG>();
