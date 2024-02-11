#!/usr/bin/env node

/*jshint esversion: 6 */

/**
 * @author: Derek Scott
 * @version: 2021-03-17 04:36:45
 * @file: Creates complex color scales and expanded palette from simple base colors
 */

// Global Variables
const { textUI } = require("./tui.cjs");
const cg = require("../package.json");
const gdb = require("./gdb.json");
const fs = require("fs");
const _ = require("lodash");
const path = require("path");
const chalk = require("chalk");
const jetpack = require("fs-jetpack");
const ColorScale = require("color-scale");
const json2scss = require("json2scss");
const json2scssMap = require("json2scss-map");

class TokenColors {
  constructor(tokenFile, outputFile) {
    this.tokenFile = tokenFile;
    this.resultFile = outputFile;
  }

  assemblePalette() {
    textUI.headerLog("Color Palette Generation Starting");

    textUI.statusTxt("Loading template file & preparing to populate");

    let newFile = path.resolve(__dirname, "../../" + this.resultFile);
    textUI.templateNewFile(
      newFile,
      "Design Tokens Color Palette. Generated via '$> node cli/bin/mojo.js'"
    );

    textUI.statusTxt("Parsing "+this.tokenFile+" file for values");

    let cTokenFile = path.resolve(__dirname, "../../" + this.tokenFile);

    var color_tokens = require(cTokenFile);

    color_tokens.forEach((element) => {
      this.processColorObj(element, newFile);
    });

    // Finally close out the file, move into place and report as done
    jetpack.append(newFile, "\r\n");

    console.log(" ");
    textUI.statusTxt("SCSS file " + newFile + " created!");
    console.log(" ");
  }

  saveColorJSONFile(filename, filedata) {
    //textUI.headerLog("Color Palette JSON");
    //console.log(JSON.stringify(filedata));

    //textUI.statusTxt("Building Color theme JSON");

    if (Object.keys(filedata).length > 0) {
      let newFile = path.resolve(
        __dirname,
        "../../" + gdb.dev.media + "/" + filename + ".json"
      );

      let prettyJSON = JSON.stringify(filedata, null, 4);

      textUI.statusTxt("Saving JSON Tokens File");
      jetpack.write(newFile, prettyJSON);
    }
  }

  processColorObj(obj, targetFile) {
    let MasterJSON = {};

    for (const [key, value] of Object.entries(obj)) {
      textUI.statusTxt(`${key}` + " processing");

      if (key == "base16") {
        textUI.statusTxt("custom base16 coloring....");
        let Hex = { Hexidecimal: {} };

        value.forEach((element) => {
          for (const [ckey, cvalue] of Object.entries(element)) {
            var cVal = `${cvalue}`;
            var cleanColor = cVal.replace(/^#/, "");
            var cKey = `${ckey}`;

            var objB16 = {};
            objB16[cKey] = "#" + cleanColor;

            Hex.Hexidecimal[cKey] = "#" + cleanColor;

            let sassData = json2scss(objB16);
            jetpack.append(targetFile, sassData);
          }
        });

        let hexData = json2scss(Hex);
        jetpack.append(targetFile, "\r\n");
        jetpack.append(targetFile, "\r\n");
        jetpack.append(targetFile, hexData);
        jetpack.append(targetFile, "\r\n");
      } else {
        //colorGroups.push({ key: key, values: value });
        value.forEach((element) => {
          for (const [ckey, cvalue] of Object.entries(element)) {
            var cVal = `${cvalue}`;
            var cleanColor = cVal.replace(/^#/, "");

            var cScale = ColorScale({
              color: "#" + cleanColor,
              variance: 8,
            });

            var cKey = `${ckey}`;
            var mKey = `${ckey}s`;
            var n = 0;
            var keys = [];

            var mapC = {};
            mapC["100"] = cScale(-4);
            mapC["200"] = cScale(-3);
            mapC["300"] = cScale(-2);
            mapC["400"] = cScale(-1);
            mapC["500"] = "#" + cleanColor;
            mapC["600"] = cScale(1);
            mapC["700"] = cScale(2);
            mapC["800"] = cScale(3);
            mapC["900"] = cScale(4);

            let sassData = json2scss(objC);
            let blankObj = {};
            blankObj[mKey] = mapC;
            let sassDataMap = json2scss(blankObj);
            //console.log(sassData);
            jetpack.append(targetFile, sassData);
            jetpack.append(targetFile, "\r\n");
            jetpack.append(targetFile, sassDataMap);
            jetpack.append(targetFile, "\r\n");

            if (key == "colors") {
              MasterJSON[ckey] = mapC;
            }
          }
        });
      }
    }

    this.saveColorJSONFile("stack", MasterJSON);
  }

  addDefaultSass() {
    let cTokenFile = path.resolve(__dirname, "../../" + this.resultFile);
    let fileData = jetpack.read(cTokenFile);
    let result = fileData.replace(/;/g, " !default;");
    jetpack.write(cTokenFile, result);
  }
}

module.exports = TokenColors;
