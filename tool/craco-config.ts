import { stateFromEnvValue } from "./util";
import HtmlPlugin from "./webpack-plugin-html";
process.env.DEVKIT && console.log(stateFromEnvValue(process.env.DEVKIT));

export default {
  babel: {
    presets: ["@emotion/babel-preset-css-prop"],
  },
  plugins: [
    {
      plugin: HtmlPlugin,
    },
  ],
};
