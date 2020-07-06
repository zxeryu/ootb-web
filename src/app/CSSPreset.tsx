import React, { ReactNode } from "react";
import { theme, ThemeState } from "../core/style/Theme";
import { Global } from "@emotion/core";
import { normalize, cover } from "polished";
import { select } from "../core/style";

export const CSSPreset = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeState fontSize={theme.fontSizes.s}>
      <Global styles={normalize()} />
      <Global styles={select("*", "*::after", "*::before").boxSizing("border-box")} />

      <Global
        styles={select("html", "body")
          .position("relative")
          .height("100%")
          .width("100%")
          .overflow("hidden")
          .with(select("body").fontSize(theme.state.fontSize).color(theme.state.color))
          .with(select("a").color(theme.colors.primary).textDecoration("none"))
          .with(select("#root").overflow("hidden").with(cover()))}
      />

      {children}
    </ThemeState>
  );
};
