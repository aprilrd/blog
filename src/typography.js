import Typography from "typography";

const typography = new Typography({
  baseFontSize: "100px",
  baseLineHeight: 1.45,
  headerFontFamily: [
    "Avenir Next",
    "Helvetica Neue",
    "Segoe UI",
    "Helvetica",
    "Arial",
    "sans-serif",
  ],
  bodyFontFamily: ["Helvetica Neue", "serif"],
  bodyColor: "red",
});

if (process.env.NODE_ENV !== "production") {
  typography.injectStyles();
}

export default typography;
