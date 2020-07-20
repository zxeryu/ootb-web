import spawn from "cross-spawn";
import { IState } from "./devkit";
import { stringify } from "querystring";

export const envValueFromState = (state: IState) => Buffer.from(JSON.stringify(state)).toString("base64");

export const stateFromEnvValue = (envValue: string): IState =>
  JSON.parse(Buffer.from(envValue, "base64").toString("utf8"));

export const stringifyMetaContent = (o: any = {}) =>
  stringify(o, ",", "=", {
    encodeURIComponent: (v) => v,
  });

export const exec = (sh: string, state: IState) => {
  const cmd = spawn(sh, {
    shell: true,
    stdio: "inherit",
    detached: false,
    env: {
      ...process.env,
      DEVKIT: envValueFromState(state),
    },
  });
  cmd.on("close", (code) => {
    if (code !== 0) {
      process.exit(code);
    }
  });
  process.on("SIGINT", () => {
    cmd.kill("SIGINT");
  });
  process.on("SIGTERM", () => {
    cmd.kill("SIGTERM");
  });
  process.on("exit", () => {
    cmd.kill();
  });
};
