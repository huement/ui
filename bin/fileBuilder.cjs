#!/usr/bin/env node

/*jshint esversion: 6 */

/**
 * @author: Derek Scott
 * @version: 2021-03-17 04:36:45
 * @file: Generates SCSS Files from JSON Data
 */

// Global Variables
const { textUI } = require('./tui.cjs')
const cg = require('../package.json')
const fs = require('fs')
const _ = require('lodash')
const path = require('path')
const chalk = require('chalk')
const jetpack = require('fs-jetpack')

const json2scss = require('json2scss')
const json2scssMap = require('json2scss-map')
const { Value } = require('sass')

class FileBuilder {
    constructor(tokenFile, outputFile) {
        this.tokenFile = tokenFile
        this.resultFile = outputFile
    }

    generateFile() {
        textUI.headerLog('Config File Generation Starting')
        textUI.statusTxt('Loading template file & preparing to populate')

        let newFile = path.resolve(__dirname, '../' + this.resultFile)
        textUI.templateNewFile(
            newFile,
            "Config File. Generated via '$> node bin/cli.js file'"
        )

        textUI.statusTxt('Parsing ' + this.tokenFile + ' file for values')

        let jsonTokenFile = path.resolve(__dirname, '../' + this.tokenFile)

        var jsonTokens = require(jsonTokenFile)
        //console.log(jsonTokens)

        for (const [key, value] of Object.entries(jsonTokens)) {
            console.log(key)
            //for (const [key, value] of Object.entries(obj)) {
            this.processARRAY(jsonTokens[key], newFile)
        }

        // jsonTokens.forEach((element) => {
        //     this.processJSONObj(element, newFile)
        // })

        // // Finally close out the file, move into place and report as done
        jetpack.append(newFile, '\r\n')

        console.log(' ')
        textUI.statusTxt('SCSS file ' + newFile + ' created!')
        console.log(' ')
    }

    saveJSONFile(filename, filedata) {
        //textUI.headerLog("Color Palette JSON");
        //console.log(JSON.stringify(filedata));
        var tokenDir = this.tokenFile.split('/')

        //textUI.statusTxt("Building Color theme JSON");

        if (Object.keys(filedata).length > 0) {
            let newFile = path.resolve(
                __dirname,
                '../../' + tokenDir[0] + '/' + filename + '.json'
            )

            let prettyJSON = JSON.stringify(filedata, null, 4)

            textUI.statusTxt('Saving JSON Tokens File ' + filename)
            jetpack.write(newFile, prettyJSON)
        }
    }

    processARRAY(array, targetFile) {
        // let MasterJSON = []
        // array.forEach((element) => {
        //     this.processJSONObj(element, newFile)
        // })

        let compiledData = json2scss(array)
        jetpack.append(targetFile, '\r\n')
        jetpack.append(targetFile, '\r\n')
        jetpack.append(targetFile, compiledData)
        jetpack.append(targetFile, '\r\n')
    }

    processJSONObj(obj, targetFile) {
        let MasterJSON = {}

        for (const [key, value] of Object.entries(obj)) {
            textUI.statusTxt(`${key}` + ' processing')

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
        }

        this.saveJSONFile('stack', MasterJSON)
    }

    // Add !default to any scss file
    addDefaultSass() {
        let jsonTokenFile = path.resolve(__dirname, '../' + this.resultFile)
        let fileData = jetpack.read(jsonTokenFile)
        let result = fileData.replace(/;/g, ' !default;')
        jetpack.write(jsonTokenFile, result)
    }
}

module.exports = FileBuilder
