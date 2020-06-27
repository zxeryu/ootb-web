import { Interpolation } from "@emotion/core";
import { isEmpty, isFunction } from "lodash";
import { CSSProperties } from "react";
import { Theme } from "./Theme";

export type InterpolationBuilder = (t: Theme) => Interpolation;

const applyStyles = (...interpolations: Array<InterpolationBuilder | Interpolation>) => (t: any): Interpolation => {
  const styles: Interpolation[] = [];

  for (const interpolation of interpolations) {
    styles.push(isFunction(interpolation) ? interpolation(t) : interpolation);
  }

  if (styles.length === 0) {
    return {};
  }

  if (styles.length === 1) {
    return styles[0];
  }

  return styles;
};

export interface BuilderProperties extends CSSProperties {
  with: Interpolation;
}

export type CSSBuilder = {
  [k in keyof BuilderProperties]-?: (arg: ((t: Theme) => BuilderProperties[k]) | BuilderProperties[k]) => CSSBuilder;
} & {
  (t: Theme): Interpolation;
};

type StyleOrBuilderSet = {
  [k: string]: any | ((t: any) => any);
};

const buildStyle = (styleOrBuilders: StyleOrBuilderSet) => (t: any): Interpolation => {
  const styles = {} as any;

  for (const prop in styleOrBuilders) {
    const styleOrBuilder = styleOrBuilders[prop];
    const value = isFunction(styleOrBuilder) ? styleOrBuilder(t) : styleOrBuilder;

    styles[prop] = value;
  }

  return styles;
};

export const selectKeys = (...selectors: string[]) => selectors.join(", ");

const createBuilder = (
  selectors: readonly string[],
  styleOrBuilders: StyleOrBuilderSet = {},
  interpolationOrBuilders: ReadonlyArray<Interpolation> = [],
) => {
  const applyTheme = (t: any) => {
    const n = selectors.length;

    const final = applyStyles(
      ...(isEmpty(styleOrBuilders)
        ? interpolationOrBuilders
        : [...interpolationOrBuilders, buildStyle(styleOrBuilders)]),
    )(t);

    if (n === 0) {
      return final;
    }

    return {
      [selectKeys(...selectors)]: final,
    };
  };

  const builder = new Proxy(applyTheme, {
    get(_, prop) {
      if (prop === "with") {
        return (v: any): any => {
          return createBuilder(
            selectors,
            {},
            !isEmpty(styleOrBuilders)
              ? [...interpolationOrBuilders, buildStyle(styleOrBuilders), v]
              : [...interpolationOrBuilders, v],
          );
        };
      }

      return (v: any): any => {
        styleOrBuilders[prop as any] = v;
        return builder;
      };
    },
  }) as CSSBuilder;

  return builder;
};

export function select(...selectors: readonly string[]): CSSBuilder {
  return createBuilder(selectors, {}, []);
}
