import React, { FunctionComponent, ReactNode, useContext, useMemo } from "react";
import { ThemeContext } from "@emotion/core";
import { mapValues, forEach, isFunction, keys } from "lodash";
import { rgba } from "polished";
import { colors } from "./colors";

export type ValueOrThemeGetter<T> = T | ((t: Theme) => T);

const fontSizes = {
  xs: 12,
  s: 14,
  normal: 16,
  m: 20,
  l: 24,
  xl: 30,
  xxl: 38,
};

const lineHeights = {
  condensedUltra: 1,
  condensed: 1.25,
  normal: 1.5,
};

const fontWeights = {
  light: 300,
  normal: 400,
  bold: 500,
};

const radii = {
  s: 2,
  normal: 4,
  l: 8,
};

const state = {
  lineHeight: lineHeights.normal,
  fontSize: fontSizes.normal,
  color: colors.black,
  backgroundColor: colors.white,
  borderColor: rgba(colors.white, 0.1),
};

export const defaultTheme = {
  state,
  colors: {
    primary: colors.blue,
    success: colors.green,
    warning: colors.yellow,
    danger: colors.red,
    info: colors.grey,
  },
  fontSizes,
  lineHeights,
  fontWeights,
  radii,
};

export interface Theme extends Readonly<typeof defaultTheme> {}

export const theme: {
  [S in keyof Theme]: {
    [V in keyof Theme[S]]: (t: Theme) => Theme[S][V];
  };
} = mapValues(defaultTheme, (values, s) => {
  return mapValues(values, (_, v) => {
    return (t: any) => {
      return t[s][v];
    };
  });
}) as any;

export const ThemeProvider = (props: { theme?: Theme; children?: React.ReactNode }) => (
  <ThemeContext.Provider value={props.theme || defaultTheme}>{props.children}</ThemeContext.Provider>
);

export const useTheme = (): Theme => {
  return (useContext(ThemeContext) as any) || defaultTheme;
};

const themeStateKeys = keys(defaultTheme.state);

export const ThemeState = ({
  children,
  root,
  autoColor,
  ...state
}: {
  [V in keyof Theme["state"]]?: ValueOrThemeGetter<Theme["state"][V]>;
} & {
  children: ReactNode;
  root?: boolean;
  autoColor?: boolean;
}) => {
  const t = useTheme();

  const deps: any[] = [t];

  const nextState = {} as any;

  forEach(themeStateKeys, (k) => {
    const n = (state as any)[k];

    nextState[k] = n ? (isFunction(n) ? n(t) : n) : (t.state as any)[k];

    deps.push(nextState[k]);
  });

  const next = useMemo((): Theme => {
    // if (autoColor) {
    //   nextState.color = safeTextColor(nextState.backgroundColor);
    // }
    return {
      ...t,
      state: nextState,
    };
  }, deps);

  return <ThemeProvider theme={next}>{children}</ThemeProvider>;
};

export const withThemeState = (
  state: {
    [V in keyof Theme["state"]]?: Theme["state"][V] | ((t: Theme) => Theme["state"][V]);
  },
) => {
  return <T extends {}>(Comp: FunctionComponent<T>) => (props: T) => {
    return (
      <ThemeState {...state}>
        <Comp {...props} />
      </ThemeState>
    );
  };
};
