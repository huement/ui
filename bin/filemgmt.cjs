/*jshint esversion: 6 */
const { textUI } = require('./tui.cjs')
const jetpack = require('fs-jetpack')
const logo = require('asciiart-logo')
const crypto = require('crypto')
const json2scss = require('json2scss')
const fs = require('fs')
const cg = require('../package.json')
const path = require('path')
const bannerFile = './_header.txt'
const replace = require('replace-in-file')
const copy = require('recursive-copy')

/**
 * Everything and anything todo with file system files
 * @function fileMGMT
 * @yields {fileOk:boolean} Almost always returns Boolean result
 */

class fileMGMT {
    constructor() {
        // textUI.headerLog('FILE MANAGER UP AND RUNNING!')
        this.MasterJSON = {}
    }

    async getParsedPackage(jsonFile = './package.json') {
        return JSON.parse(fs.readFileSync(jsonFile))
    }

    templateNewFile(newFilePath, fileDesc) {
        let newFileName = path.basename(newFilePath)
        let tempFilePath = path.resolve(__dirname, '../.cache/' + newFileName)
        let bannerFilePath = path.resolve(__dirname, bannerFile)

        //this.statusTxt("Creating New Templated File");

        // Setup New File from Template
        //jetpack.copy(bannerFile, tempFilePath, { overwrite: true });

        let fileData = jetpack.read(bannerFilePath)

        let dString = textUI.makeADate()

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
    }

    blankNewFile(newFilePath) {
        //let filePath = path.resolve(__dirname, "../../" + newFilePath);

        if (jetpack.exists(newFilePath)) {
            jetpack.remove(newFilePath)
        }

        jetpack.write(newFilePath, '')
    }

    async scssDataFile() {
        textUI.statusTxt('Populating HUI SCSS with data from package.json')

        let packageData = await this.getParsedPackage()
        let newFilePath = 'scss/config/_data.scss'
        let filePath = path.resolve(__dirname, '../' + newFilePath)

        if (jetpack.exists(newFilePath)) {
            jetpack.remove(newFilePath)
        }

        const codeName = packageData.codeName ?? 'mojo'

        let finalHUIData = {
            name: `"${packageData.name}"`,
            codeName: `"${codeName}"`,
            homepage: packageData.homepage,
            version: `"${packageData.version}"`,
        }

        let finalResultData = finalHUIData
        if (packageData.hui) {
            finalResultData = { ...finalHUIData, ...packageData.hui }
        }

        let sassData = json2scss(finalResultData)

        jetpack.write(newFilePath, sassData)
        jetpack.append(newFilePath, '\r\n')
    }

    returnAllFiles() {
        return true
    }

    async replaceFileString(fileName) {
        const replaceOptions = {
            files: fileName,
            from: /#REPLACE#/g,
            to: Math.floor(Date.now() / 1000),
        }

        try {
            const results = await replace(replaceOptions)
            console.log('Replacement results:', results)
        } catch (error) {
            console.error('Error occurred:', error)
        }
    }

    async replaceLoop() {
        const replaceFiles = [
            'dist/javascript.html',
            'dist/theme.html',
            'dist/navmenu.html',
        ]
        await replaceFiles.forEach(async (element) => {
            await this.replaceFileString(element)
        })

        return true
    }

    async copyFolder(
        target = 'web/public',
        dest = 'dist',
        options = {
            overwrite: true,
            expand: true,
            dot: true,
            junk: false,
        }
    ) {
        copy(target, dest, options)
            .then(function (results) {
                console.log('\n')
                textUI.taskTxt('COPIED ' + results.length + ' FILES')
                console.log('\n')
                replaceLoop()
            })
            .catch(function (error) {
                textUI.errorTxt('COPY FAILURE!!! ' + error)
            })

        if (jetpack.exists('dist/icons/')) {
            textUI.statusTxt('REMOVE OLD ICONS DIRECTORY')
            jetpack.remove('dist/icons/')
        }
    }
}

// const fileMGMT = {
//     getParsedPackage(jsonFile = './package.json') {
//         return JSON.parse(fs.readFileSync(jsonFile))
//     },
//     templateNewFile(newFilePath, fileDesc) {
//         let newFileName = path.basename(newFilePath)
//         let tempFilePath = path.resolve(__dirname, '../.cache/' + newFileName)
//         let bannerFilePath = path.resolve(__dirname, bannerFile)

//         //this.statusTxt("Creating New Templated File");

//         // Setup New File from Template
//         //jetpack.copy(bannerFile, tempFilePath, { overwrite: true });

//         let fileData = jetpack.read(bannerFilePath)

//         let dString = textUI.makeADate()

//         let result3 = fileData.replace(/<<NAME>>/g, newFileName)
//         let result2 = result3.replace(/<<DATE>>/g, dString)
//         let result1 = result2.replace(/<<DESCRIPTION>>/g, fileDesc)
//         let result0 = result1.replace(/<<VERSION>>/g, cg.version)

//         // Replace templated data with the real thing
//         if (jetpack.exists(tempFilePath)) {
//             jetpack.remove(tempFilePath)
//         }
//         jetpack.write(tempFilePath, result0)

//         // Add some space to make room for the actual SASS data
//         jetpack.append(tempFilePath, '\r\n')

//         jetpack.move(tempFilePath, newFilePath, { overwrite: true })
//     },
//     blankNewFile(newFilePath) {
//         //let filePath = path.resolve(__dirname, "../../" + newFilePath);

//         if (jetpack.exists(newFilePath)) {
//             jetpack.remove(newFilePath)
//         }

//         jetpack.write(newFilePath, '')
//     },
//     scssDataFile() {
//         let packageData = this.getParsedPackage()
//         let newFilePath = ''
//         let filePath = path.resolve(__dirname, '../' + newFilePath)

//         if (jetpack.exists(newFilePath)) {
//             jetpack.remove(newFilePath)
//         }

//         jetpack.write(newFilePath, '')
//     },
//     returnAllFiles() {
//         return true
//     },
// }

// export the courses so other modules can use them
module.exports = fileMGMT
// exports.fileMGMT = fileMGMT
