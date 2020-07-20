import { stateFromEnvValue } from "./util";

process.env.DEVKIT && console.log(stateFromEnvValue(process.env.DEVKIT));

export default {
  babel: {
    presets: ["@emotion/babel-preset-css-prop"],
  },
};
