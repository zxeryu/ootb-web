import yargs from "yargs";
import { exec } from "./util";
import { join } from "path";
import { existsSync, readFileSync } from "fs";
import { isObject, has, take, keys, mapKeys, isEmpty, startsWith, mapValues, isFunction } from "lodash";

export interface IState {
  cwd: string;
  context: string;
  name: string;
  env: string;
  meta: { [key: string]: { [k: string]: string } };
}

const loadConfig = (state: IState) => {
  const configPath = join(state.context, "config.ts");
  if (!existsSync(configPath)) {
    return;
  }

  // @ts-ignore
  const config = require(configPath);

  const envs = mapKeys(config.ENVS, (key) => key.toLowerCase());
  const envKeys = keys(envs);
  if (envKeys.length > 0 && (isEmpty(state.env) || !envs[state.env])) {
    console.warn(`[warning] missing env, use ${envKeys[0]} as default, or use one of ${envKeys.join(", ")}`);
    state.env = envKeys[0];
  }
  state.meta = {};
  for (const key in config) {
    if (has(config, key) && startsWith(key, "APP_")) {
      const metaKey = key.slice(4).toLowerCase();

      state.meta[metaKey] = mapValues(config[key], (fnOrValue) =>
        isFunction(fnOrValue) ? fnOrValue(state.env, state.name) : fnOrValue,
      ) as any;
    }
  }
};

const devkit = (cwd = process.cwd()) => {
  let actions: { [k: string]: string } = {
    dev: "echo 'dev'",
    build: "echo 'build'",
  };

  const packagePath = join(cwd, "package.json");
  if (existsSync(packagePath)) {
    try {
      const packageJson = JSON.parse(String(readFileSync(packagePath)));
      if (packageJson && isObject(packageJson.devkit)) {
        actions = { ...packageJson.devkit };
      }
    } catch (e) {
      console.error(e);
    }
  }

  return {
    actions,
    run: (action: string, app: string, env: string) => {
      if (!has(actions, action)) {
        throw new Error(`missing action ${keys(actions)}`);
      }

      const appPath = join(cwd, "src", app);
      if (!existsSync(appPath)) {
        throw new Error("missing app");
      }

      //load config from ${app}/config.ts
      const state: IState = {
        cwd,
        context: join(cwd, "src", app),
        name: app,
        env,
        meta: {},
      };

      loadConfig(state);

      // console.log(actions[action], state);

      exec(actions[action], state);
    },
  };
};

(async () => {
  // exec("craco start");

  //输入参数
  const argv = yargs.usage("Usage: $0 <action> [env] [options]").option("app", {
    alias: "app",
    type: "string",
    default: "app",
    desc: "app name",
  }).argv;

  //处理
  const kit = devkit(process.cwd());

  try {
    const commands = take(argv._, 2);
    kit.run(commands[0], argv.app, commands[1]);
  } catch (e) {
    console.error(e.toString() + "\n");
  }
})();

// const run = () => {};
