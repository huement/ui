const colorRed = "#FF0000";
const colorBlue = "#0099FF";
const package = require("../package.json");

module.exports = {
  plumeVersion: package.version,
  plumeDate: package.built,
  plumeCodeName: package.codename,
  colors: {
    red: colorRed,
    green: "#00FF00",
    blue: colorBlue,
  },
  outputStyle: "compressed",
  targetDirName: "lib",
  superclass: "plume",
  prefixer: {
    prefix: "",
    ignore: [".plume"],
  },
};
