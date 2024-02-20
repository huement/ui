#!/usr/bin/env node

/*jshint esversion: 6 */

/**
 * @file Brief description of the file here
 * @author FirstName LastName <optionalEmail@example.com>
 * @copyright FirstName LastName Year
 * @license LicenseHereIfApplicable
 */

// Libraries
// const config = require("../package.json");
// const chalk = require("chalk");
// const cliSelect = require("cli-list-select");

const jetpack = require('fs-jetpack')
const logo = require('asciiart-logo')
const chalk = require('chalk')
const crypto = require('crypto')
const fs = require('fs')
const cg = require('../package.json')
const path = require('path')
const bannerFile = './_header.txt'

const good = chalk.bold.green
const info = chalk.bold.cyan
const bad = chalk.bold.red
const vapor = chalk.bold.magenta
const paper = chalk.bold.white

/**
 * Brief description of the function here.
 * @generator
 * @function functionNameHere
 * @yields {yieldDataType} Brief description of yielded items here.
 */
const textUI = {
    // Header Display
    outputHeader(pc) {
        // Output Logo to Terminal
        console.log(
            logo({
                name: pc.name,
                font: 'Cosmike',
                lineChars: 10,
                padding: 2,
                margin: 2,
                borderColor: 'black',
                logoColor: 'bold-cyan',
                textColor: 'bold-magenta',
            })
                .right('ver: ' + pc.version)
                .emptyLine()
                .center(pc.description)
                .render()
        )
    },
    outputMiniHeader(pc) {
        console.log(
            logo({
                name: '  ' + pc.name + '  ',
                font: 'Cosmike',
                lineChars: 20,
                padding: 2,
                margin: 2,
                borderColor: 'black',
                logoColor: 'bold-cyan',
            })
                .emptyLine()
                .render()
        )
    },
    headerLog(text, hC = 0) {
        // prettier-ignore
        let headerCount = ["⚀","⚁","⚂","⚃","⚄","⚅","⚀⚅","⚁⚅","⚂⚅","⚃⚅","⚄⚅","⚅⚅"];

        let bSpace = ' '
        if (hC < 7) {
            bSpace = ' ◼'
        }

        console.log(
            info(
                '  ◼◼◼◼◼◼◼ ◼◼◼◼◼◼◼◼◼ ◼◼◼◼◼◼◼◼◼◼ ◼◼◼ ◼◼◼ ' +
                    headerCount[hC] +
                    ' ◼◼◼◼ ◼◼◼◼◼◼◼◼ ◼◼'
            )
        )

        console.log(good('  ' + text))
        console.log(
            info(
                '  ◼◼◼ ◼◼◼ ◼◼◼◼◼◼◼◼◼◼◼◼ ◼◼ ◼◼◼◼◼◼ ◼◼◼ ◼◼◼◼◼◼' +
                    bSpace +
                    '◼◼◼◼◼◼◼◼ ◼◼◼'
            )
        )
        console.log(' ')
    },
    statusTxt(text) {
        console.log(info('  [INFO]  ') + vapor(text))
    },
    taskTxt(text) {
        console.log(good('  [ OK ]  ') + good(text))
    },
    errorTxt(text) {
        console.log(bad('  [FAIL]  ') + bad(text))
    },
    basicMsg(text) {
        console.log('  ' + paper(text))
    },
    quoteString(string) {
        return "'" + string + "'"
    },
    scssVar(name, value, quotes = false) {
        let scssString = ''
        if (quotes !== false) {
            scssString = '$' + name + ': "' + value + '" !default;'
        } else {
            scssString = '$' + name + ': ' + value + ' !default;'
        }

        return scssString
    },
    makeADate() {
        // prettier-ignore
        const monthNames = ["JAN","FEB","MAR","APR","MAY","JUNE","JULY","AUG","SEPT","OCT","NOV","DEC"];

        let date_ob = new Date()
        let date = ('0' + date_ob.getDate()).slice(-2)
        let month = monthNames[date_ob.getMonth()]
        let year = date_ob.getFullYear()
        let dateString = month + ' ' + date + ' ' + year

        return dateString
    },
    hashString(string, limit = false) {
        // change to 'md5' if you want an MD5 hash
        var hash = crypto.createHash('sha256')

        // change to 'binary' if you want a binary hash.
        hash.setEncoding('hex')

        // the text that you want to hash
        hash.write(string)

        // very important! You cannot read from the stream until you have called end()
        hash.end()

        // and now you get the resulting hash
        let sha256sum = hash.read()

        if (limit) {
            sha256sum = sha256sum.substring(0, limit)
        }

        return sha256sum
    },
    templateNewFile(newFilePath, fileDesc) {
        let newFileName = path.basename(newFilePath)
        let tempFilePath = path.resolve(
            __dirname,
            '../../.cache/' + newFileName
        )
        let bannerFilePath = path.resolve(__dirname, bannerFile)

        //this.statusTxt("Creating New Templated File");

        // Setup New File from Template
        //jetpack.copy(bannerFile, tempFilePath, { overwrite: true });

        let fileData = jetpack.read(bannerFilePath)

        let dString = this.makeADate()

        let result3 = fileData.replace(/<<NAME>>/g, newFileName)
        let result2 = result3.replace(/<<DATE>>/g, dString)
        let result1 = result2.replace(/<<DESCRIPTION>>/g, fileDesc)
        let result0 = result1.replace(/<<VERSION>>/g, cg.version)

        // Replace templated data with the real thing
        if (jetpack.exists(tempFilePath)) {
            jetpack.remove(tempFilePath)
        }
        jetpack.write(tempFilePath, result0)

        // Add some space to make room for the actual SASS data
        jetpack.append(tempFilePath, '\r\n')

        jetpack.move(tempFilePath, newFilePath, { overwrite: true })
    },
    blankNewFile(newFilePath) {
        //let filePath = path.resolve(__dirname, "../../" + newFilePath);

        if (jetpack.exists(newFilePath)) {
            jetpack.remove(newFilePath)
        }

        jetpack.write(newFilePath, '')
    },
}

//outputHeader(config);

// export the courses so other modules can use them
exports.textUI = textUI
