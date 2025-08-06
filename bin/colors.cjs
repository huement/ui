/*jshint esversion: 6 */

/**
 * @author: Derek Scott
 * @version: 2021-03-17 04:36:45
 * @file: Creates complex color scales and expanded palette from simple base colors
 */

// Global Variables
const { textUI } = require('./tui.cjs')
const fileMGMT = require('./filemgmt.cjs')
const cg = require('../package.json')
const path = require('path')
const jetpack = require('fs-jetpack')
const ColorScale = require('color-scale')
const json2scss = require('json2scss')
const json2scssMap = require('json2scss-map')

class TokenColors {
  constructor(tokenFile, outputFile, outputJSONFile) {
    textUI.headerLog('Color Palette Generation LOADING')
    this.tokenFile = tokenFile
    this.resultFile = outputFile
    this.codeName = cg.codeName || 'hui'
    this.jsonColorFile = outputJSONFile
    this.MasterJSON = {}
  }

  assemblePalette() {
    textUI.statusTxt('Loading template file & preparing to populate')

    let newFile = path.resolve(__dirname, '../' + this.resultFile)
    const fm = new fileMGMT()
    fm.templateNewFile(
      newFile,
      `${cg.name} generated file > npm run build:colors`
    )

    textUI.statusTxt('Parsing ' + this.tokenFile + ' file for values')

    let cTokenFile = path.resolve(__dirname, '../' + this.tokenFile)

    var color_tokens = require(cTokenFile)
    for (let i = 0; i < color_tokens.length; i++) {
      this.processColorObj(color_tokens[i], newFile)
    }

    // Finally close out the file, move into place and report as done
    jetpack.append(newFile, '\r\n')

    console.log(' ')
    textUI.statusTxt('SCSS Created! Saved to ' + newFile)
    console.log(' ')

    // console.log( JSON.stringify( this.MasterJSON ) )
    this.saveColorJSONFile(this.MasterJSON)
  }

  saveColorJSONFile(filedata) {
    //textUI.headerLog("Color Palette JSON");
    //console.log(JSON.stringify(filedata));
    // var tokenDir = this.tokenFile.split('/')

    //textUI.statusTxt("Building Color theme JSON");

    if (Object.keys(filedata).length > 0) {
      let newFile = path.resolve(__dirname, '../' + this.jsonColorFile)

      let prettyJSON = JSON.stringify(filedata, null, 4)

      textUI.statusTxt('Saving JSON Tokens File ' + newFile)
      jetpack.write(newFile, prettyJSON)
    }
  }

  processColorObj(obj, targetFile) {
    for (const [key, value] of Object.entries(obj)) {
      textUI.statusTxt(`${key}` + ' processing')

      if (key === 'theme') {
        textUI.statusTxt('adding theme colors to scss....')
        let theme = {}
        let themeMap = {}
        value.forEach((element) => {
          for (const [ckey, cvalue] of Object.entries(element)) {
            var cScale = ColorScale({ color: '#' + cvalue, variance: 11 })
            var lightKey = `${ckey}-light`
            var darkKey = `${ckey}-dark`
            var hKey = `hui-${ckey}`
            theme[ckey] = '#' + cvalue
            themeMap[hKey] = {
              hex: '#' + cvalue,
              light: cScale(2),
              dark: cScale(-2),
            }
          }
        })

        let hexData = json2scss(theme)
        jetpack.append(targetFile, '\r\n')
        jetpack.append(targetFile, hexData)
        jetpack.append(targetFile, '\r\n')

        let hexExtraData = json2scss(themeMap)
        jetpack.append(targetFile, '\r\n')
        jetpack.append(targetFile, hexExtraData)
        jetpack.append(targetFile, '\r\n')
      } else if (key === 'base16') {
        textUI.statusTxt('adding base16 theme to scss....')
        let Hex = { Hexidecimal: {} }

        value.forEach((element) => {
          for (const [ckey, cvalue] of Object.entries(element)) {
            var cVal = `${cvalue}`
            var cleanColor = cVal.replace(/^#/, '')
            var cKey = `${ckey}`

            var objB16 = {}
            objB16[cKey] = '#' + cleanColor

            Hex.Hexidecimal[cKey] = '#' + cleanColor

            let sassData = json2scss(objB16)
            jetpack.append(targetFile, sassData)
          }
        })

        let hexData = json2scss(Hex)
        jetpack.append(targetFile, '\r\n')
        jetpack.append(targetFile, '\r\n')
        jetpack.append(targetFile, hexData)
        jetpack.append(targetFile, '\r\n')
      } else {
        //colorGroups.push({ key: key, value: value });
        textUI.statusTxt('Building Color Scales from Tokens....')

        value.forEach((element) => {
          for (const [ckey, cvalue] of Object.entries(element)) {
            var cVal = `${cvalue}`
            var cleanColor = cVal.replace(/^#/, '')

            var cScale = ColorScale({ color: '#' + cleanColor, variance: 11 })

            // var colorKey = `${ckey}`
            var mKey = `${ckey}`
            var n = 0
            const numberObj = {}
            numberObj[`${ckey}-100`] = cScale(-4)
            numberObj[`${ckey}-200`] = cScale(-3)
            numberObj[`${ckey}-300`] = cScale(-2)
            numberObj[`${ckey}-400`] = cScale(-1)
            numberObj[`${ckey}-500`] = '#' + cleanColor
            numberObj[`${ckey}-600`] = cScale(1)
            numberObj[`${ckey}-700`] = cScale(2)
            numberObj[`${ckey}-800`] = cScale(3)
            numberObj[`${ckey}-900`] = cScale(4)

            var huiColor = {
              hex: '#' + cleanColor,
              light: cScale(3),
              dark: cScale(-3),
            }

            var mapC = {}
            mapC['100'] = cScale(-4)
            mapC['200'] = cScale(-3)
            mapC['300'] = cScale(-2)
            mapC['400'] = cScale(-1)
            mapC['500'] = '#' + cleanColor
            mapC['600'] = cScale(1)
            mapC['700'] = cScale(2)
            mapC['800'] = cScale(3)
            mapC['900'] = cScale(4)

            let sassData = json2scss(numberObj)

            let blankObj = {}
            let pluralKey = mKey === 'mono' ? 'mono' : `${mKey}-stack`
            blankObj[pluralKey] = mapC
            let sassDataMap = json2scss(blankObj)

            let blankHUI = {}
            blankHUI[`hui-${ckey}`] = huiColor
            let huiDataMap = json2scss(blankHUI)

            //console.log(sassData);
            jetpack.append(targetFile, sassData)
            jetpack.append(targetFile, '\r\n')
            jetpack.append(targetFile, sassDataMap)
            jetpack.append(targetFile, '\r\n')
            jetpack.append(targetFile, huiDataMap)
            jetpack.append(targetFile, '\r\n')

            this.MasterJSON[ckey] = mapC
          }
        })
      }
    }
  }

  // Add !default to any scss file
  addDefaultSass() {
    let cTokenFile = path.resolve(__dirname, '../' + this.resultFile)
    let fileData = jetpack.read(cTokenFile)
    let result = fileData.replace(/;/g, ' !default;')
    jetpack.write(cTokenFile, result)
  }
}

module.exports = TokenColors
