#!/usr/bin/env node

/**
 * @file Main Design Token generator. Execute imported sections
 * @description Generates all of the dynamic files for hui. Using the package.json file and some .env values as its inputs.
 * @author Derek Scott <derek@huement.com>
 * @version 05/03/2022_09.25
 */

const { textUI } = require('./tui.cjs')
const { fileMGMT } = require('./filemgmt.cjs')
const TokenColors = require('./colors.cjs')
const TokenColors = require('./colors.cjs')
const PugPageBuilder = require('./pug.cjs')
// const TokenFonts = require("./fonts");
// const TokenChords = require("./chords");
const cg = require('../package.json')
const debugOutput = cg.debugMode || false

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs( hideBin( process.argv ) ).argv

// TODO Add in package handling such as install dependencies?
// TODO Use Args to choose what happens when this script is called.
// TODO Optionally have a selectable menu allowing users to select which cmd to run

process.on('exit', function (code) {
    return console.log(`Exiting with code: ${code}`)
})

textUI.outputHeader(cg.name)

let colorList = 'tokens/color_tokens.json'
let colorSCSS = 'scss/config/_palette-test.scss'

// TODO: By default running this script runs all the commands,
//       but if ANY flag is present, then it only runs that specific command
//       This example below is a workable template
// if (argv.command) {
//   textUI.taskTxt('Run That Command')
// } else {
//     if ( debugOutput ) {
//         textUI.infoTxt('Command Argv not found')
//     }
// }

const tc = new TokenColors(colorList, colorSCSS)
tc.assemblePalette()
tc.addDefaultSass()

const tf = new TokenFonts('fontPath', 'fontTarget')
tf.assembleFontFiles()

// Design Token Chords
// Pass in chords.json file path
// let chordList = gdb.chordTokens
const td = new TokenChords('../tokens/gdb.json')
td.assmebleChordTokens()

// Pug webpage builder
// Assembles all .html files
const pugBuilder = new PugPageBuilder()
pugBuilder.buildWebpages()
pugBuilder.buildDocumentation()

// TODO: icon build
