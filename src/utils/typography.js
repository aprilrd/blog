import Typography from "typography";
import deYoungTheme from "typography-theme-de-young";

const theme = {
  ...deYoungTheme,
  baseFontSize: "17.5px",
  headerFontFamily: ["Merriweather", "Georgia"],
  bodyFontFamily: ["Merriweather", "Georgia"],
  includeNormalize: true,
  googleFonts: [
    {
      name: "Merriweather",
      styles: ["400", "400i", "500", "500i", "700", "700i"],
    },
  ],
};

const typography = new Typography(theme);

if (process.env.NODE_ENV !== "production") {
  typography.injectStyles();
}

const { rhythm, scale } = typography;
export { rhythm, scale, typography as default };
