export const ENVS = {
  STAGING: "staging",
  DEMO: "demo",
  LOCAL: "local",
  ONLINE: "online",
};

export const APP_MANIFEST = {
  name: "nest-demo-web",
  short_name: "app",
};

export const ALIAS = APP_MANIFEST.name;

export const APP_CONFIG = {
  APP_NAME: () => {
    return APP_MANIFEST.short_name;
  },
  ENV: (env: string) => {
    return env.toLowerCase();
  },
};
