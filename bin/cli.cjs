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
 *  TODO Add in package handling such as install dependencies?
 *  TODO Grunt Commands added to command list...
 *  TODO Creating new SASS sections from template. (SCSS + PUG Template)
 *
 */

/**
 * @file Main Design Token generator. Execute imported sections
 * @author Derek Scott <derek@huement.com>
 * @version 05/03/2022_09.25
 */

const args = require('yargs').argv
const { textUI } = require('./tui')
const TokenColors = require('./colors')
// const TokenFonts = require("./fonts");
// const TokenChords = require("./chords");
const cg = require('../package.json')

// TODO implement this instead of "warPig"
// const gdb = require("../../gdb.json");

// TODO Use Args to choose what happens when this script is called.
// TODO Optionally have a selectable menu allowing users to select which cmd to run

// TODO make an icon script that turns SVGs into icon font, and then into SCSS imports.

process.on('exit', function (code) {
    return console.log(`Exiting with code: ${code}`)
})

let colorList = '../tokens/colors.json'
let colorSCSS = 'build/scss/core/_palette.scss'

const tc = new TokenColors(colorList, colorSCSS)
tc.assemblePalette()
tc.addDefaultSass()

if (args.fonts !== undefined) {
    const tf = new TokenFonts('fontPath', 'fontTarget')
    tf.assembleFontFiles()
}

// Design Token Chords
// Pass in chords.json file path
let chordList = gdb.chordTokens
const td = new TokenChords(chordList)
td.assmebleChordTokens()
