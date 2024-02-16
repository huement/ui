module.exports = {
  inputDir: "tokens/icons/theme", // (required)
  outputDir: "dist/hi", // (required)
  fontTypes: ["ttf", "woff", "woff2"],
  assetTypes: ["css", "json", "html"],
  fontsUrl: "/fonts/icons",
  formatOptions: {
    // Pass options directly to `svgicons2svgfont`
    json: {
      // render the JSON human readable with two spaces indentation (default is none, so minified)
      indent: 2
    }
  },
  prefix: "hui",
  // Use a custom Handlebars template
  templates: {
    css: "tokens/icons/icon-tp.css.hbs"
  }
}
