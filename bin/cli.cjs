#!/usr/bin/env node

/**
 * @file Main Design Token generator. Execute imported sections
 * @description Generates all of the dynamic files for hui.
 *              Uses package.json file + others as inputs
 * @author Derek Scott <derek@huement.com>
 * @version 05/03/2022_09.25
 */

const { textUI } = require('./tui.cjs')
const fileMGMT = require('./filemgmt.cjs')
const TokenColors = require('./colors.cjs')
const TokenChords = require('./chords.cjs')
const TokenFonts = require('./fonts.cjs')
const _ = require('lodash')
const cg = require('../package.json')
const debugOutput = cg.debugMode || true

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv

// TODO Optionally have a selectable menu allowing users to select which cmd to run

process.on('exit', function (code) {
  if (debugOutput) return console.log(`Exiting with code: ${code}`)
})

// Display a cool banner message based on package.json data
textUI.outputHeader(cg)

const colorList = 'tokens/color_tokens.json' // basic hex codes used to build theme from
const colorSCSS = 'scss/hui/_palette.scss' // SCSS file w/ tokens + generated color stacks
const colorJSON = 'dist/generated_colors.json' // List of all colors that were created

const resultList = []

function sleep(ms) {
  console.log('SLEEPING!!')
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function init() {
  // TODO: By default running this script runs NO commands. Must pass a flag
  if (argv['_'] && argv['_'][0]) {
    for (let i = 0; i < argv['_'].length; i++) {
      const theCmd = _.trim(argv['_'][i])
      textUI.infoTxt('Input Command: ' + theCmd)

      if (theCmd === 'data' || theCmd === 'data') {
        const fm = new fileMGMT()
        fm.scssDataFile()
        resultList.push('data')
      }

      if (theCmd === 'color' || theCmd === 'colors') {
        const tc = new TokenColors(colorList, colorSCSS, colorJSON)
        tc.assemblePalette()
        sleep(2000)
        tc.addDefaultSass()
        resultList.push('color')
      }

      if (theCmd === 'chord' || theCmd === 'chords') {
        // Design Token Chords
        // Pass in chords.json file path
        // let chordList = gdb.chordTokens
        const td = new TokenChords(cg.hui)
        td.assmebleChordTokens()
        // await sleep(2000)
        td.addDefaultTagsSass()
        resultList.push('chord')
      }
    }
  }
}

// textUI.infoTxt( JSON.stringify( argv ) )
// return false

// const tf = new TokenFonts( 'fontPath', 'fontTarget' )
// tf.assembleFontFiles()
init()

if (resultList.length >= 1) {
  textUI.taskTxt(resultList.join(' ') + ' tasks ran')
} else {
  textUI.infoTxt('ZERO tasks ran')
}

// TODO: icon build
