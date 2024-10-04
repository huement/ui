#!/usr/bin/env node

//  COMMAND LINE TOOLKIT | DESIGN TOKENS, SASS PROCESSING, TYPOGRAPHY SCALE & RHYTHM
//

/**
 *  COMMAND SECTIONS
 *
 *  1. Color Palette
 *  2. Font Files
 *  3. 'Chord' Tokens
 *  4. ...
 *
 */

/**
 * @file Main Design Token generator. Execute imported sections
 * @author Derek Scott <derek@huement.com>
 * @version 05/03/2022_09.25
 */

const args = require('yargs').argv
const { textUI } = require('./tui.cjs')
const { fileMGMT } = require('./filemgmt.cjs')
const TokenColors = require('./colors.cjs')
const TokenChords = require('./chords.cjs')
// const TokenFonts = require("./fonts");
// const TokenChords = require("./chords");
const cg = require('../package.json')

// TODO Add in package handling such as install dependencies?
// TODO Use Args to choose what happens when this script is called.
// TODO Optionally have a selectable menu allowing users to select which cmd to run

process.on('exit', function (code) {
    return console.log(`Exiting with code: ${code}`)
})

let colorList = 'tokens/color_tokens.json'
let colorSCSS = 'scss/config/_palette-test.scss'

const tc = new TokenColors(colorList, colorSCSS)
tc.assemblePalette()
tc.addDefaultSass()

// TODO: Yargs setup
// if (args.fonts !== undefined) {
//     const tf = new TokenFonts('fontPath', 'fontTarget')
//     tf.assembleFontFiles()
// }

// Design Token Chords
// Pass in chords.json file path
// let chordList = gdb.chordTokens
const td = new TokenChords('../tokens/gdb.json')
td.assmebleChordTokens()

// TODO: icon build

// TODO: pug build

// TODO: s3 bundle
