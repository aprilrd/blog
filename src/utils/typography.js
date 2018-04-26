import Typography from "typography";
import deYoungTheme from "typography-theme-de-young";
deYoungTheme.baseFontSize = "17.5px";
deYoungTheme.headerFontFamily = ["Merriweather", "Georgia"];
deYoungTheme.bodyFontFamily = ["Merriweather", "Georgia"];
const typography = new Typography(deYoungTheme);

if (process.env.NODE_ENV !== "production") {
  typography.injectStyles();
}

export default typography;
