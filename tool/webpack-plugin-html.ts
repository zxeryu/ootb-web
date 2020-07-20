import { stateFromEnvValue, stringifyMetaContent } from "./util";
import { get } from "lodash";

const overrideWebpackConfig = ({ webpackConfig }: { webpackConfig: any }) => {
  //find HtmlWebpackPlugin Object
  const htmlPlugin = webpackConfig.plugins.find((p: any) => p.constructor.name === "HtmlWebpackPlugin");
  //reset meta if not exist
  !htmlPlugin.options.meta && (htmlPlugin.options.meta = {});
  //add meta config
  const state = process.env.DEVKIT ? stateFromEnvValue(process.env.DEVKIT) : null;
  if (state) {
    const manifest = get(state.meta, "manifest");
    const config = get(state.meta, "config");
    if (manifest) {
      htmlPlugin.options.meta = {
        ...htmlPlugin.options.meta,
        [`${state.alias}:app`]: stringifyMetaContent({
          ...state.meta.manifest,
          env: state.env,
        }),
      };
    }
    if (config) {
      htmlPlugin.options.meta = {
        ...htmlPlugin.options.meta,
        [`${state.alias}:config`]: stringifyMetaContent({
          ...state.meta.config,
        }),
      };
    }
  }
  return webpackConfig;
};

export default { overrideWebpackConfig };
